import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
})

export const PRICE_DIGITAL = 990   // A$9.90
export const PRICE_KIT = 4990      // A$49.90
