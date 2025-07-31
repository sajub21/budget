const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/subscriptions/plans
// @desc    Get available subscription plans
// @access  Private
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'GBP',
        interval: 'month',
        features: [
          'Up to 100 products',
          'Manual sales tracking',
          'Basic dashboard',
          'Email support'
        ],
        limits: {
          products: 100,
          apiIntegrations: false,
          advancedAnalytics: false
        }
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 7.99,
        currency: 'GBP',
        interval: 'month',
        features: [
          'Unlimited products',
          'API integrations (Vinted, Depop)',
          'Advanced analytics',
          'Profit optimization tools',
          'Priority support',
          'CSV export/import',
          'Multi-user access'
        ],
        limits: {
          products: -1, // unlimited
          apiIntegrations: true,
          advancedAnalytics: true
        }
      }
    ];

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    logger.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching plans'
    });
  }
});

// @route   POST /api/subscriptions/create-checkout
// @desc    Create Stripe checkout session for Pro subscription
// @access  Private
router.post('/create-checkout', async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({
        success: false,
        message: 'Payment processing not configured'
      });
    }

    const { plan } = req.body;
    
    if (plan !== 'pro') {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }

    // Create or get Stripe customer
    let stripeCustomerId = req.user.subscription.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        metadata: {
          userId: req.user._id.toString()
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(req.user._id, {
        'subscription.stripeCustomerId': stripeCustomerId
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'LOFT Pro Subscription',
              description: 'Unlimited products, API integrations, and advanced analytics'
            },
            unit_amount: 799, // £7.99 in pence
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/subscription/cancel`,
      metadata: {
        userId: req.user._id.toString()
      }
    });

    logger.info(`Checkout session created for user: ${req.user.email}`);

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    logger.error('Create checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating checkout session'
    });
  }
});

// @route   GET /api/subscriptions/status
// @desc    Get current subscription status
// @access  Private
router.get('/status', async (req, res) => {
  try {
    const subscription = req.user.subscription;
    
    let stripeSubscription = null;
    if (subscription.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      } catch (error) {
        logger.warn(`Failed to retrieve Stripe subscription: ${error.message}`);
      }
    }

    res.json({
      success: true,
      data: {
        type: subscription.type,
        status: stripeSubscription?.status || 'active',
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
        stripeSubscription: stripeSubscription ? {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
        } : null
      }
    });
  } catch (error) {
    logger.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subscription status'
    });
  }
});

// @route   POST /api/subscriptions/cancel
// @desc    Cancel subscription at period end
// @access  Private
router.post('/cancel', async (req, res) => {
  try {
    const { stripeSubscriptionId } = req.user.subscription;
    
    if (!stripeSubscriptionId || !process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    // Update user record
    await User.findByIdAndUpdate(req.user._id, {
      'subscription.cancelAtPeriodEnd': true
    });

    logger.info(`Subscription cancelled for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current period',
      data: {
        cancelAtPeriodEnd: true,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    });
  } catch (error) {
    logger.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling subscription'
    });
  }
});

// @route   POST /api/subscriptions/reactivate
// @desc    Reactivate cancelled subscription
// @access  Private
router.post('/reactivate', async (req, res) => {
  try {
    const { stripeSubscriptionId } = req.user.subscription;
    
    if (!stripeSubscriptionId || !process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({
        success: false,
        message: 'No subscription found'
      });
    }

    // Reactivate subscription
    const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    // Update user record
    await User.findByIdAndUpdate(req.user._id, {
      'subscription.cancelAtPeriodEnd': false
    });

    logger.info(`Subscription reactivated for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      data: {
        cancelAtPeriodEnd: false,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    });
  } catch (error) {
    logger.error('Reactivate subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reactivating subscription'
    });
  }
});

// @route   POST /api/subscriptions/webhook
// @desc    Handle Stripe webhooks
// @access  Public (but verified with Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).json({ error: 'Webhook secret not configured' });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      logger.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.metadata.userId;
        
        if (session.mode === 'subscription') {
          // Update user subscription
          await User.findByIdAndUpdate(userId, {
            'subscription.type': 'pro',
            'subscription.stripeSubscriptionId': session.subscription,
            'subscription.currentPeriodEnd': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          });
          
          logger.info(`Pro subscription activated for user: ${userId}`);
        }
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        if (invoice.subscription) {
          // Update subscription period
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          await User.findOneAndUpdate(
            { 'subscription.stripeSubscriptionId': subscription.id },
            {
              'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000)
            }
          );
        }
        break;

      case 'invoice.payment_failed':
        // Handle failed payment
        logger.warn(`Payment failed for subscription: ${event.data.object.subscription}`);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        // Downgrade user to free tier
        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': deletedSubscription.id },
          {
            'subscription.type': 'free',
            'subscription.stripeSubscriptionId': null,
            'subscription.currentPeriodEnd': null,
            'subscription.cancelAtPeriodEnd': false
          }
        );
        
        logger.info(`Subscription cancelled and user downgraded: ${deletedSubscription.id}`);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

module.exports = router;
