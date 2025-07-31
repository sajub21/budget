const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Expense = require('../models/Expense');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/expenses
// @desc    Get user's expenses with filtering and pagination
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
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

    if (req.query.category) filter.category = req.query.category;
    if (req.query.product) filter.product = req.query.product;
    
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    // Get expenses with pagination
    const expenses = await Expense.find(filter)
      .populate('product', 'name sku')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Expense.countDocuments(filter);

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    logger.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenses'
    });
  }
});

// @route   POST /api/expenses
// @desc    Add new expense
// @access  Private
router.post('/', [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').isIn([
    'Product Cost', 'Packaging', 'Shipping', 'Platform Fees',
    'Marketing & Ads', 'Equipment', 'Office Supplies', 'Travel',
    'Storage', 'Professional Services', 'Other'
  ]).withMessage('Invalid category'),
  body('description').notEmpty().trim().withMessage('Description is required'),
  body('date').optional().isISO8601(),
  body('product').optional().isMongoId()
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

    const expenseData = {
      ...req.body,
      user: req.user._id,
      currency: req.body.currency || req.user.currency
    };

    const expense = new Expense(expenseData);
    await expense.save();

    // Populate product if exists
    await expense.populate('product', 'name sku');

    logger.info(`New expense added: ${expense.description} by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: expense
    });
  } catch (error) {
    logger.error('Add expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding expense'
    });
  }
});

// @route   GET /api/expenses/:id
// @desc    Get single expense
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('product', 'name sku');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    logger.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expense'
    });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', [
  body('amount').optional().isFloat({ min: 0 }),
  body('category').optional().isIn([
    'Product Cost', 'Packaging', 'Shipping', 'Platform Fees',
    'Marketing & Ads', 'Equipment', 'Office Supplies', 'Travel',
    'Storage', 'Professional Services', 'Other'
  ]),
  body('description').optional().notEmpty().trim(),
  body('date').optional().isISO8601(),
  body('product').optional().isMongoId()
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

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('product', 'name sku');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    logger.info(`Expense updated: ${expense.description} by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    logger.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating expense'
    });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense (soft delete)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isArchived: true },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    logger.info(`Expense archived: ${expense.description} by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    logger.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting expense'
    });
  }
});

// @route   GET /api/expenses/analytics/summary
// @desc    Get expense analytics summary
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

    // Total expenses in period
    const totalExpenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          isArchived: false,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Expenses by category
    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          isArchived: false,
          date: { $gte: startDate, $lte: endDate }
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

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          isArchived: false,
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period: {
          startDate,
          endDate
        },
        summary: totalExpenses[0] || { total: 0, count: 0 },
        categoryBreakdown,
        monthlyTrend
      }
    });
  } catch (error) {
    logger.error('Expense analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expense analytics'
    });
  }
});

module.exports = router;
