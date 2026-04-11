import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ override: true })

import authRoutes from './routes/auth.js'
import sinsRoutes from './routes/sins.js'
import stripeRoutes from './routes/stripe.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000
const isProd = process.env.NODE_ENV === 'production'

// Stripe webhook needs raw body — must be mounted BEFORE express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))

// CORS — in production the frontend is served by Express itself so no CORS needed
// In dev, allow Vite dev server
app.use(cors({
  origin: isProd ? false : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}))

app.use(express.json({ limit: '10kb' }))
app.use(morgan(isProd ? 'combined' : 'dev'))

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/auth', authLimiter)
app.use('/api', apiLimiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/sins', sinsRoutes)
app.use('/api/stripe', stripeRoutes)

app.get('/api/usage', (req, res) => res.redirect('/api/sins/usage'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve frontend in production (single Express server serves everything)
if (isProd) {
  app.use(express.static(path.join(__dirname, 'dist')))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[Server] Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`[Server] Absolved running on http://localhost:${PORT} (${isProd ? 'production' : 'development'})`)
})
