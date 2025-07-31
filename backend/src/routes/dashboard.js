const express = require('express');
const { query, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/dashboard
// @desc    Get dashboard overview with key metrics
// @access  Private
router.get('/', [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']),
  query('currency').optional().isIn(['GBP', 'USD', 'EUR'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const period = req.query.period || 'month';
    const currency = req.query.currency || req.user.currency;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Inventory overview
    const inventoryOverview = await Product.aggregate([
      { $match: { user: req.user._id, isArchived: false } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: '$pricing.purchasePrice' },
          lowStockItems: {
            $sum: {
              $cond: [{ $eq: ['$status', 'low_stock'] }, 1, 0]
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: [{ $eq: ['$status', 'out_of_stock'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Sales metrics for the period
    const salesMetrics = await Sale.aggregate([
      {
        $match: {
          user: req.user._id,
          isArchived: false,
          saleDate: { $gte: startDate },
          currency: currency
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$salePrice' },
          totalFees: {
            $sum: {
              $add: [
                '$fees.platformFee',
                '$fees.paymentFee', 
                '$fees.shippingFee',
                '$fees.other',
                { $multiply: ['$fees.promotionDiscount', -1] }
              ]
            }
          },
          averageOrderValue: { $avg: '$salePrice' }
        }
      }
    ]);

    // Expense metrics for the period
    const expenseMetrics = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          isArchived: false,
          date: { $gte: startDate },
          currency: currency
        }
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          expenseCount: { $sum: 1 }
        }
      }
    ]);

    // Calculate profit metrics
    const salesData = salesMetrics[0] || { totalSales: 0, totalRevenue: 0, totalFees: 0, averageOrderValue: 0 };
    const expenseData = expenseMetrics[0] || { totalExpenses: 0, expenseCount: 0 };
    const inventoryData = inventoryOverview[0] || { totalProducts: 0, totalValue: 0, lowStockItems: 0, outOfStockItems: 0 };

    const netRevenue = salesData.totalRevenue - salesData.totalFees;
    const netProfit = netRevenue - expenseData.totalExpenses;
    const profitMargin = netRevenue > 0 ? ((netProfit / netRevenue) * 100).toFixed(2) : 0;

    // Top selling products in period
    const topProducts = await Sale.aggregate([
      {
        $match: {
          user: req.user._id,
          isArchived: false,
          saleDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$product',
          totalSold: { $sum: '$quantity' },
          totalRevenue: { $sum: '$salePrice' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $project: {
          product: { $arrayElemAt: ['$product', 0] },
          totalSold: 1,
          totalRevenue: 1
        }
      }
    ]);

    // Recent sales (last 10)
    const recentSales = await Sale.find({
      user: req.user._id,
      isArchived: false
    })
    .populate('product', 'name sku images')
    .sort({ saleDate: -1 })
    .limit(10)
    .lean();

    // Platform performance
    const platformPerformance = await Sale.aggregate([
      {
        $match: {
          user: req.user._id,
          isArchived: false,
          saleDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$platform',
          sales: { $sum: 1 },
          revenue: { $sum: '$salePrice' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Sales trend (daily for the period)
    const salesTrend = await Sale.aggregate([
      {
        $match: {
          user: req.user._id,
          isArchived: false,
          saleDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' },
            day: { $dayOfMonth: '$saleDate' }
          },
          sales: { $sum: 1 },
          revenue: { $sum: '$salePrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Expense breakdown by category
    const expenseBreakdown = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          isArchived: false,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    // Calculate previous period for comparison
    const previousPeriodStart = new Date(startDate);
    const periodLength = now.getTime() - startDate.getTime();
    previousPeriodStart.setTime(startDate.getTime() - periodLength);

    const previousSalesMetrics = await Sale.aggregate([
      {
        $match: {
          user: req.user._id,
          isArchived: false,
          saleDate: { $gte: previousPeriodStart, $lt: startDate },
          currency: currency
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$salePrice' },
          totalSales: { $sum: 1 }
        }
      }
    ]);

    const previousData = previousSalesMetrics[0] || { totalRevenue: 0, totalSales: 0 };
    const revenueGrowth = previousData.totalRevenue > 0 
      ? (((salesData.totalRevenue - previousData.totalRevenue) / previousData.totalRevenue) * 100).toFixed(2)
      : salesData.totalRevenue > 0 ? 100 : 0;

    const salesGrowth = previousData.totalSales > 0
      ? (((salesData.totalSales - previousData.totalSales) / previousData.totalSales) * 100).toFixed(2)
      : salesData.totalSales > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        period: {
          type: period,
          startDate,
          endDate: now
        },
        metrics: {
          inventory: inventoryData,
          sales: {
            ...salesData,
            netRevenue,
            growth: parseFloat(salesGrowth)
          },
          expenses: expenseData,
          profit: {
            netProfit,
            profitMargin: parseFloat(profitMargin),
            revenueGrowth: parseFloat(revenueGrowth)
          }
        },
        charts: {
          salesTrend,
          platformPerformance,
          expenseBreakdown
        },
        insights: {
          topProducts,
          recentSales: recentSales.slice(0, 5) // Limit to 5 for dashboard
        }
      }
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/dashboard/alerts
// @desc    Get important alerts and notifications
// @access  Private
router.get('/alerts', async (req, res) => {
  try {
    const alerts = [];

    // Low stock alerts
    const lowStockProducts = await Product.find({
      user: req.user._id,
      isArchived: false,
      status: 'low_stock'
    }).select('name sku inventory.quantity inventory.restockThreshold').limit(10);

    if (lowStockProducts.length > 0) {
      alerts.push({
        type: 'low_stock',
        severity: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockProducts.length} product(s) are running low on stock`,
        data: lowStockProducts,
        actionRequired: true
      });
    }

    // Out of stock alerts
    const outOfStockCount = await Product.countDocuments({
      user: req.user._id,
      isArchived: false,
      status: 'out_of_stock'
    });

    if (outOfStockCount > 0) {
      alerts.push({
        type: 'out_of_stock',
        severity: 'error',
        title: 'Out of Stock',
        message: `${outOfStockCount} product(s) are out of stock`,
        actionRequired: true
      });
    }

    // Subscription alerts (for free users approaching limits)
    if (req.user.subscription.type === 'free') {
      const productCount = await Product.countDocuments({
        user: req.user._id,
        isArchived: false
      });

      if (productCount >= 80) { // 80% of free limit
        alerts.push({
          type: 'subscription_limit',
          severity: 'info',
          title: 'Approaching Product Limit',
          message: `You have ${productCount}/100 products. Upgrade to Pro for unlimited inventory.`,
          data: { currentCount: productCount, limit: 100 },
          actionRequired: false
        });
      }
    }

    // Pending sales alerts
    const pendingSalesCount = await Sale.countDocuments({
      user: req.user._id,
      isArchived: false,
      status: { $in: ['pending', 'paid'] }
    });

    if (pendingSalesCount > 0) {
      alerts.push({
        type: 'pending_sales',
        severity: 'info',
        title: 'Pending Sales',
        message: `You have ${pendingSalesCount} sale(s) that need attention`,
        actionRequired: true
      });
    }

    res.json({
      success: true,
      data: {
        alerts,
        count: alerts.length
      }
    });
  } catch (error) {
    logger.error('Dashboard alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching alerts'
    });
  }
});

module.exports = router;
