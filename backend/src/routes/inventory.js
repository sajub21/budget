const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const { inventoryLimitMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/inventory
// @desc    Get user's inventory with filtering and pagination
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('status').optional().isIn(['active', 'low_stock', 'out_of_stock', 'archived']),
  query('brand').optional().isString(),
  query('search').optional().isString()
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
      isArchived: req.query.status === 'archived' ? true : false
    };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.status && req.query.status !== 'archived') filter.status = req.query.status;
    if (req.query.brand) filter.brand = new RegExp(req.query.brand, 'i');
    
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { brand: new RegExp(req.query.search, 'i') },
        { sku: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') }
      ];
    }

    // Get products with pagination
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Product.countDocuments(filter);

    // Get inventory summary
    const summary = await Product.aggregate([
      { $match: { user: req.user._id, isArchived: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$pricing.purchasePrice' }
        }
      }
    ]);

    const summaryFormatted = {
      total: total,
      active: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0
    };

    summary.forEach(item => {
      summaryFormatted.totalValue += item.totalValue;
      switch (item._id) {
        case 'active':
          summaryFormatted.active = item.count;
          break;
        case 'low_stock':
          summaryFormatted.lowStock = item.count;
          break;
        case 'out_of_stock':
          summaryFormatted.outOfStock = item.count;
          break;
      }
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        },
        summary: summaryFormatted
      }
    });
  } catch (error) {
    logger.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory'
    });
  }
});

// @route   POST /api/inventory
// @desc    Add new product to inventory
// @access  Private
router.post('/', inventoryLimitMiddleware, [
  body('name').notEmpty().trim().withMessage('Product name is required'),
  body('category').isIn([
    'Clothing', 'Shoes', 'Bags', 'Accessories', 'Electronics', 
    'Books', 'Home & Garden', 'Sports', 'Beauty', 'Other'
  ]).withMessage('Invalid category'),
  body('condition').isIn([
    'New with tags', 'New without tags', 'Excellent', 'Good', 'Fair', 'Poor'
  ]).withMessage('Invalid condition'),
  body('pricing.purchasePrice').isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
  body('pricing.listingPrice').optional().isFloat({ min: 0 }),
  body('inventory.quantity').optional().isInt({ min: 0 }),
  body('inventory.restockThreshold').optional().isInt({ min: 0 })
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

    const productData = {
      ...req.body,
      user: req.user._id
    };

    const product = new Product(productData);
    await product.save();

    logger.info(`New product added: ${product.name} by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product
    });
  } catch (error) {
    logger.error('Add product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding product'
    });
  }
});

// @route   GET /api/inventory/:id
// @desc    Get single product
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update product
// @access  Private
router.put('/:id', [
  body('name').optional().notEmpty().trim(),
  body('category').optional().isIn([
    'Clothing', 'Shoes', 'Bags', 'Accessories', 'Electronics', 
    'Books', 'Home & Garden', 'Sports', 'Beauty', 'Other'
  ]),
  body('condition').optional().isIn([
    'New with tags', 'New without tags', 'Excellent', 'Good', 'Fair', 'Poor'
  ]),
  body('pricing.purchasePrice').optional().isFloat({ min: 0 }),
  body('pricing.listingPrice').optional().isFloat({ min: 0 }),
  body('inventory.quantity').optional().isInt({ min: 0 }),
  body('inventory.restockThreshold').optional().isInt({ min: 0 })
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

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    logger.info(`Product updated: ${product.name} by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete product (soft delete - archive)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isArchived: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    logger.info(`Product archived: ${product.name} by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Product archived successfully'
    });
  } catch (error) {
    logger.error('Archive product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while archiving product'
    });
  }
});

// @route   POST /api/inventory/bulk
// @desc    Bulk import products (Pro feature)
// @access  Private
router.post('/bulk', async (req, res) => {
  try {
    if (req.user.subscription.type !== 'pro') {
      return res.status(403).json({
        success: false,
        message: 'Bulk import requires Pro subscription',
        upgradeRequired: true
      });
    }

    const { products } = req.body;
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required'
      });
    }

    const productsWithUser = products.map(product => ({
      ...product,
      user: req.user._id
    }));

    const insertedProducts = await Product.insertMany(productsWithUser, {
      ordered: false, // Continue on error
      rawResult: true
    });

    logger.info(`Bulk import: ${products.length} products by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${insertedProducts.insertedCount} products`,
      data: {
        imported: insertedProducts.insertedCount,
        failed: products.length - insertedProducts.insertedCount
      }
    });
  } catch (error) {
    logger.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk import'
    });
  }
});

// @route   GET /api/inventory/analytics/overview
// @desc    Get inventory analytics overview
// @access  Private
router.get('/analytics/overview', async (req, res) => {
  try {
    const analytics = await Product.aggregate([
      { $match: { user: req.user._id, isArchived: false } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: '$pricing.purchasePrice' },
          averagePrice: { $avg: '$pricing.purchasePrice' },
          totalQuantity: { $sum: '$inventory.quantity' },
          categories: { $addToSet: '$category' },
          brands: { $addToSet: '$brand' }
        }
      }
    ]);

    const categoryBreakdown = await Product.aggregate([
      { $match: { user: req.user._id, isArchived: false } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          value: { $sum: '$pricing.purchasePrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const lowStockItems = await Product.find({
      user: req.user._id,
      isArchived: false,
      status: 'low_stock'
    }).select('name sku inventory.quantity inventory.restockThreshold').limit(10);

    res.json({
      success: true,
      data: {
        overview: analytics[0] || {
          totalProducts: 0,
          totalValue: 0,
          averagePrice: 0,
          totalQuantity: 0,
          categories: [],
          brands: []
        },
        categoryBreakdown,
        lowStockItems
      }
    });
  } catch (error) {
    logger.error('Inventory analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
});

module.exports = router;
