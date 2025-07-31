const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  businessName: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    default: 'GBP',
    enum: ['GBP', 'USD', 'EUR']
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: Boolean
  },
  integrations: {
    vinted: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      refreshToken: String,
      lastSync: Date
    },
    depop: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      refreshToken: String,
      lastSync: Date
    }
  },
  preferences: {
    notifications: {
      lowStock: { type: Boolean, default: true },
      profitGoals: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true }
    },
    restockThreshold: { type: Number, default: 5 },
    darkMode: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.type': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.integrations.vinted.accessToken;
  delete userObject.integrations.vinted.refreshToken;
  delete userObject.integrations.depop.accessToken;
  delete userObject.integrations.depop.refreshToken;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
