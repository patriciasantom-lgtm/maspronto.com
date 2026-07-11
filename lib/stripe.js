import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
})

export const PRICE_DIGITAL = parseInt(process.env.PRICE_DIGITAL || process.env.NEXT_PUBLIC_PRICE_DIGITAL || '990')
export const PRICE_KIT = parseInt(process.env.PRICE_KIT || process.env.NEXT_PUBLIC_PRICE_KIT || '4990')
