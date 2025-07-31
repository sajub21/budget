const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/sales
// @desc    Get user's sales with filtering and pagination
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('platform').optional().isString(),
  query('status').optional().isIn(['pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('product').optional().isMongoId()
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { 
      user: req.user._id,
      isArchived: false
    };

    if (req.query.platform) filter.platform = req.query.platform;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.product) filter.product = req.query.product;
    
    if (req.query.startDate || req.query.endDate) {
      filter.saleDate = {};
      if (req.query.startDate) filter.saleDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.saleDate.$lte = new Date(req.query.endDate);
    }

    // Get sales with pagination
    const sales = await Sale.find(filter)
      .populate('product', 'name sku brand pricing.purchasePrice images')
      .sort({ saleDate: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Sale.countDocuments(filter);

    // Calculate profit for each sale
    const salesWithProfit = sales.map(sale => {
      const purchasePrice = sale.product?.pricing?.purchasePrice || 0;
      const netAmount = sale.salePrice - (sale.fees.platformFee + sale.fees.paymentFee + sale.fees.shippingFee + sale.fees.other - sale.fees.promotionDiscount);
      const profit = netAmount - (purchasePrice * sale.quantity);
      
      return {
        ...sale,
        netAmount,
        profit,
        profitMargin: netAmount > 0 ? ((profit / netAmount) * 100).toFixed(2) : 0
      };
    });

    res.json({
      success: true,
      data: {
        sales: salesWithProfit,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    logger.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sales'
    });
  }
});

// @route   POST /api/sales
// @desc    Add new sale
// @access  Private
router.post('/', [
  body('product').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('salePrice').isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('platform').isIn([
    'vinted', 'depop', 'ebay', 'facebook', 'instagram', 'in_person', 'other'
  ]).withMessage('Invalid platform'),
  body('saleDate').optional().isISO8601(),
  body('fees.platformFee').optional().isFloat({ min: 0 }),
  body('fees.paymentFee').optional().isFloat({ min: 0 }),
  body('fees.shippingFee').optional().isFloat({ min: 0 }),
  body('fees.promotionDiscount').optional().isFloat({ min: 0 }),
  body('fees.other').optional().isFloat({ min: 0 })
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

    // Check if product exists and belongs to user
    const product = await Product.findOne({
      _id: req.body.product,
      user: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if enough inventory
    if (product.inventory.quantity < req.body.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory. Available: ${product.inventory.quantity}, Requested: ${req.body.quantity}`
      });
    }

    const saleData = {
      ...req.body,
      user: req.user._id,
      currency: req.body.currency || req.user.currency
    };

    const sale = new Sale(saleData);
    await sale.save();

    // Populate product details
    await sale.populate('product', 'name sku brand pricing.purchasePrice images');

    logger.info(`New sale recorded: ${product.name} by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      data: sale
    });
  } catch (error) {
    logger.error('Add sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording sale'
    });
  }
});

// @route   GET /api/sales/:id
// @desc    Get single sale
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('product', 'name sku brand pricing.purchasePrice images');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    logger.error('Get sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sale'
    });
  }
});

// @route   PUT /api/sales/:id
// @desc    Update sale
// @access  Private
router.put('/:id', [
  body('quantity').optional().isInt({ min: 1 }),
  body('salePrice').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded']),
  body('fees.platformFee').optional().isFloat({ min: 0 }),
  body('fees.paymentFee').optional().isFloat({ min: 0 }),
  body('fees.shippingFee').optional().isFloat({ min: 0 }),
  body('fees.promotionDiscount').optional().isFloat({ min: 0 }),
  body('fees.other').optional().isFloat({ min: 0 })
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

    const sale = await Sale.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('product', 'name sku brand pricing.purchasePrice images');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    logger.info(`Sale updated: ${sale._id} by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Sale updated successfully',
      data: sale
    });
  } catch (error) {
    logger.error('Update sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating sale'
    });
  }
});

// @route   DELETE /api/sales/:id
// @desc    Delete sale (soft delete)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sale.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isArchived: true },
      { new: true }
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    logger.info(`Sale archived: ${sale._id} by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Sale deleted successfully'
    });
  } catch (error) {
    logger.error('Delete sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting sale'
    });
  }
});

// @route   GET /api/sales/analytics/summary
// @desc    Get sales analytics summary
// @access  Private
router.get('/analytics/summary', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('period').optional().isIn(['week', 'month', 'quarter', 'year'])
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

    // Set date range
    let startDate, endDate;
    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
    } else {
      // Default to current month if no dates provided
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Sales summary
    const salesSummary = await Sale.aggregate([
      {
        $match: {
          user: req.user._id,
          isArchived: false,
          saleDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$salePrice' },
          totalFees: { 
            $sum: { 
              $add: ['$fees.platformFee', '$fees.paymentFee', '$fees.shippingFee', '$fees.other', { $multiply: ['$fees.promotionDiscount', -1] }]
            }
          },
          averageOrderValue: { $avg: '$salePrice' }
        }
      }
    ]);

    // Platform breakdown
    const platformBreakdown = await Sale.aggregate([
      {
        $match: {
          user: req.user._id,
          isArchived: false,
          saleDate: { $gte: startDate, $lte: endDate }
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

    // Top selling products
    const topProducts = await Sale.aggregate([
      {
        $match: {
          user: req.user._id,
          isArchived: false,
          saleDate: { $gte: startDate, $lte: endDate }
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
      { $limit: 10 },
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

    // Daily sales trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrend = await Sale.aggregate([
      {
        $match: {
          user: req.user._id,
          isArchived: false,
          saleDate: { $gte: thirtyDaysAgo }
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

    res.json({
      success: true,
      data: {
        period: {
          startDate,
          endDate
        },
        summary: salesSummary[0] || { totalSales: 0, totalRevenue: 0, totalFees: 0, averageOrderValue: 0 },
        platformBreakdown,
        topProducts,
        dailyTrend
      }
    });
  } catch (error) {
    logger.error('Sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sales analytics'
    });
  }
});

module.exports = router;
