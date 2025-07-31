const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Clothing', 'Shoes', 'Bags', 'Accessories', 'Electronics', 
      'Books', 'Home & Garden', 'Sports', 'Beauty', 'Other'
    ]
  },
  condition: {
    type: String,
    required: true,
    enum: ['New with tags', 'New without tags', 'Excellent', 'Good', 'Fair', 'Poor']
  },
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  barcode: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    publicId: String, // Cloudinary public ID
    isMain: { type: Boolean, default: false }
  }],
  pricing: {
    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    },
    listingPrice: {
      type: Number,
      min: 0
    },
    recommendedPrice: {
      type: Number,
      min: 0
    }
  },
  inventory: {
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    },
    restockThreshold: {
      type: Number,
      min: 0,
      default: 1
    },
    location: {
      type: String,
      trim: true
    }
  },
  source: {
    type: String,
    enum: ['Retail Store', 'Online', 'Thrift Store', 'Wholesale', 'Donation', 'Other'],
    default: 'Other'
  },
  purchaseDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'low_stock', 'out_of_stock', 'archived'],
    default: 'active'
  },
  platforms: [{
    platform: {
      type: String,
      enum: ['vinted', 'depop', 'ebay', 'facebook', 'instagram', 'other']
    },
    listingId: String,
    url: String,
    isActive: { type: Boolean, default: true },
    listedAt: Date
  }],
  analytics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    lastViewed: Date
  },
  notes: {
    type: String,
    trim: true
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
productSchema.index({ user: 1, status: 1 });
productSchema.index({ user: 1, category: 1 });
productSchema.index({ user: 1, brand: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ 'analytics.totalSales': -1 });

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.pricing.listingPrice && this.pricing.purchasePrice) {
    return ((this.pricing.listingPrice - this.pricing.purchasePrice) / this.pricing.purchasePrice * 100).toFixed(2);
  }
  return 0;
});

// Update status based on quantity
productSchema.pre('save', function(next) {
  if (this.inventory.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.inventory.quantity <= this.inventory.restockThreshold) {
    this.status = 'low_stock';
  } else {
    this.status = 'active';
  }
  next();
});

// Generate SKU if not provided
productSchema.pre('save', async function(next) {
  if (!this.sku) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.sku = `LOFT-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
