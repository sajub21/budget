const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Middleware to check subscription level
const subscriptionMiddleware = (requiredTier) => {
  return (req, res, next) => {
    if (requiredTier === 'pro' && req.user.subscription.type !== 'pro') {
      return res.status(403).json({
        success: false,
        message: 'This feature requires a Pro subscription.',
        upgradeRequired: true
      });
    }
    next();
  };
};

// Middleware to check inventory limits for free users
const inventoryLimitMiddleware = async (req, res, next) => {
  if (req.user.subscription.type === 'free') {
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({ 
      user: req.user._id, 
      isArchived: false 
    });
    
    if (productCount >= 100) {
      return res.status(403).json({
        success: false,
        message: 'Free tier limited to 100 products. Upgrade to Pro for unlimited inventory.',
        upgradeRequired: true,
        currentCount: productCount,
        limit: 100
      });
    }
  }
  next();
};

module.exports = {
  authMiddleware,
  subscriptionMiddleware,
  inventoryLimitMiddleware
};
