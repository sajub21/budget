const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  salePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'GBP',
    enum: ['GBP', 'USD', 'EUR']
  },
  platform: {
    type: String,
    required: true,
    enum: ['vinted', 'depop', 'ebay', 'facebook', 'instagram', 'in_person', 'other']
  },
  platformOrderId: {
    type: String,
    trim: true
  },
  buyer: {
    username: String,
    name: String,
    email: String,
    rating: Number
  },
  fees: {
    platformFee: { type: Number, default: 0 },
    paymentFee: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    promotionDiscount: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  shipping: {
    method: String,
    cost: { type: Number, default: 0 },
    paidByBuyer: { type: Boolean, default: true },
    trackingNumber: String,
    carrier: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  },
  saleDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  shippedDate: Date,
  deliveredDate: Date,
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Platform Wallet', 'PayPal', 'Stripe', 'Bank Transfer', 'Cash', 'Other'],
    default: 'Platform Wallet'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  customerNote: {
    type: String,
    trim: true
  },
  internalNotes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  returns: {
    isReturned: { type: Boolean, default: false },
    returnDate: Date,
    returnReason: String,
    refundAmount: Number,
    restocked: { type: Boolean, default: false }
  },
  rating: {
    received: Number, // Rating received from buyer
    given: Number,    // Rating given to buyer
    review: String
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
saleSchema.index({ user: 1, saleDate: -1 });
saleSchema.index({ user: 1, platform: 1 });
saleSchema.index({ product: 1 });
saleSchema.index({ status: 1 });
saleSchema.index({ saleDate: -1 });

// Virtual for total fees
saleSchema.virtual('totalFees').get(function() {
  return this.fees.platformFee + this.fees.paymentFee + this.fees.shippingFee + this.fees.other - this.fees.promotionDiscount;
});

// Virtual for net amount (after fees)
saleSchema.virtual('netAmount').get(function() {
  return this.salePrice - this.totalFees;
});

// Virtual for profit calculation
saleSchema.virtual('profit').get(function() {
  if (this.populated('product') || this.product.pricing) {
    const purchasePrice = this.product.pricing.purchasePrice * this.quantity;
    return this.netAmount - purchasePrice;
  }
  return 0; // Will be calculated when product is populated
});

// Virtual for profit margin
saleSchema.virtual('profitMargin').get(function() {
  if (this.netAmount > 0) {
    return ((this.profit / this.netAmount) * 100).toFixed(2);
  }
  return 0;
});

// Virtual for formatted sale price
saleSchema.virtual('formattedSalePrice').get(function() {
  const symbols = { GBP: '£', USD: '$', EUR: '€' };
  return `${symbols[this.currency] || this.currency}${this.salePrice.toFixed(2)}`;
});

// Update product inventory when sale is saved
saleSchema.post('save', async function() {
  if (this.status === 'completed' && !this.returns.isReturned) {
    const Product = mongoose.model('Product');
    await Product.findByIdAndUpdate(
      this.product,
      { 
        $inc: { 
          'inventory.quantity': -this.quantity,
          'analytics.totalSales': this.quantity
        }
      }
    );
  }
});

// Restore inventory if sale is cancelled or refunded
saleSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && (doc.status === 'cancelled' || doc.status === 'refunded')) {
    const Product = mongoose.model('Product');
    await Product.findByIdAndUpdate(
      doc.product,
      { 
        $inc: { 
          'inventory.quantity': doc.quantity,
          'analytics.totalSales': -doc.quantity
        }
      }
    );
  }
});

module.exports = mongoose.model('Sale', saleSchema);
