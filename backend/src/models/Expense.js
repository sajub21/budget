const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
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
  category: {
    type: String,
    required: true,
    enum: [
      'Product Cost',
      'Packaging',
      'Shipping',
      'Platform Fees',
      'Marketing & Ads',
      'Equipment',
      'Office Supplies',
      'Travel',
      'Storage',
      'Professional Services',
      'Other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  vendor: {
    type: String,
    trim: true
  },
  receipt: {
    url: String,
    publicId: String // Cloudinary public ID
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null // null for general business expenses
  },
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    default: null // null for expenses not related to specific sales
  },
  platform: {
    type: String,
    enum: ['vinted', 'depop', 'ebay', 'facebook', 'instagram', 'stripe', 'paypal', 'other'],
    default: null
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly']
    },
    nextDate: Date,
    endDate: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'PayPal', 'Other'],
    default: 'Card'
  },
  taxDeductible: {
    type: Boolean,
    default: true
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
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });
expenseSchema.index({ product: 1 });
expenseSchema.index({ sale: 1 });
expenseSchema.index({ date: -1 });

// Virtual for formatted amount
expenseSchema.virtual('formattedAmount').get(function() {
  const symbols = { GBP: '£', USD: '$', EUR: '€' };
  return `${symbols[this.currency] || this.currency}${this.amount.toFixed(2)}`;
});

module.exports = mongoose.model('Expense', expenseSchema);
