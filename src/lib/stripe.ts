import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: '',
    features: [
      'Up to 10 calendars',
      'Basic AI suggestions',
      'Email reminders',
      'Web access only',
    ],
    limits: {
      calendars: 10,
      events: 100,
      storage: 100, // MB
    },
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Unlimited calendars',
      'Advanced AI scheduling',
      'Priority email support',
      'Mobile PWA access',
      'File attachments',
      'Calendar sharing',
      'Advanced integrations',
    ],
    limits: {
      calendars: -1, // unlimited
      events: -1, // unlimited
      storage: 5000, // MB
    },
  },
} as const

export type PlanType = keyof typeof PLANS
