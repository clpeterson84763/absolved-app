import { Router } from 'express'
import Stripe from 'stripe'
import { requireAuth } from '../middleware/auth.js'
import db from '../db.js'

const router = Router()

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// POST /api/stripe/create-checkout-session
// Body: { plan: 'monthly' | 'annual' }
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  const plan = req.body?.plan === 'annual' ? 'annual' : 'monthly'

  try {
    const stripe = getStripe()
    const user = db.prepare('SELECT id, email, is_premium, stripe_customer_id FROM users WHERE id = ?').get(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (user.is_premium) return res.status(400).json({ error: 'Already a premium member' })

    const priceId = plan === 'annual'
      ? process.env.STRIPE_ANNUAL_PRICE_ID
      : process.env.STRIPE_PRICE_ID

    if (!priceId) {
      return res.status(500).json({ error: `Price ID for ${plan} plan not configured` })
    }

    // Create or reuse Stripe customer
    let customerId = user.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: String(user.id) },
      })
      customerId = customer.id
      db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customerId, user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?upgraded=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?upgraded=false`,
      metadata: { userId: String(user.id) },
      subscription_data: {
        metadata: { userId: String(user.id) },
      },
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('[Stripe] Checkout session error:', err.message)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

// POST /api/stripe/webhook
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error('[Stripe] Webhook signature failed:', err.message)
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.userId
        if (userId) {
          db.prepare('UPDATE users SET is_premium = 1 WHERE id = ?').run(userId)
          console.log(`[Stripe] User ${userId} upgraded to premium`)
        }
        break
      }
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused': {
        const subscription = event.data.object
        const userId = subscription.metadata?.userId
        if (userId) {
          db.prepare('UPDATE users SET is_premium = 0 WHERE id = ?').run(userId)
          console.log(`[Stripe] User ${userId} downgraded from premium`)
        }
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error('[Stripe] Webhook handler error:', err.message)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }

  res.json({ received: true })
})

// GET /api/stripe/portal
router.get('/portal', requireAuth, async (req, res) => {
  try {
    const stripe = getStripe()
    const user = db.prepare('SELECT stripe_customer_id FROM users WHERE id = ?').get(req.userId)
    if (!user?.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found' })
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/`,
    })
    res.json({ url: session.url })
  } catch (err) {
    console.error('[Stripe] Portal error:', err.message)
    res.status(500).json({ error: 'Failed to open billing portal' })
  }
})

export default router
