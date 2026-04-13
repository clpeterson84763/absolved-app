import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { requireAuth } from '../middleware/auth.js'
import { generateAtonement } from './atonement.js'
import db from '../db.js'

const router = Router()

const FREE_TIER_LIMIT = 5

const VALID_CATEGORIES = [
  'general', 'anger', 'envy', 'pride', 'sloth',
  'greed', 'lust', 'gluttony', 'dishonesty', 'unkindness', 'neglect',
]

function getMonthlyCount(userId) {
  const row = db.prepare(`
    SELECT COUNT(*) as count FROM sins
    WHERE user_id = ?
      AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
  `).get(userId)
  return row.count
}

// GET /api/sins
router.get('/', requireAuth, (req, res) => {
  try {
    const sins = db.prepare(`
      SELECT id, description, category, atonement_reflection, atonement_action,
             atonement_affirmation, atonement_insight, atonement_status,
             notes, completed_at, created_at
      FROM sins
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).all(req.userId)

    res.json({ sins })
  } catch (err) {
    console.error('[Sins] Fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch sins' })
  }
})

// POST /api/sins
router.post(
  '/',
  requireAuth,
  [
    body('description')
      .trim()
      .isLength({ min: 5 }).withMessage('Description must be at least 5 characters')
      .isLength({ max: 1000 }).withMessage('Description must be under 1000 characters'),
    body('category')
      .optional()
      .isIn(VALID_CATEGORIES).withMessage('Invalid category'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg })
    }

    const { description, category = 'general' } = req.body

    try {
      const user = db.prepare('SELECT is_premium FROM users WHERE id = ?').get(req.userId)
      if (!user) return res.status(404).json({ error: 'User not found' })

      if (!user.is_premium) {
        const monthlyCount = getMonthlyCount(req.userId)
        if (monthlyCount >= FREE_TIER_LIMIT) {
          return res.status(403).json({
            error: 'Free tier limit reached',
            code: 'LIMIT_REACHED',
            limit: FREE_TIER_LIMIT,
            used: monthlyCount,
          })
        }
      }

      // Insert sin with pending status first
      const insert = db.prepare(`
        INSERT INTO sins (user_id, description, category, atonement_status)
        VALUES (?, ?, ?, 'pending')
      `).run(req.userId, description, category)

      const sinId = insert.lastInsertRowid

      // Generate atonement guidance via Claude
      let atonement = null
      try {
        atonement = await generateAtonement(description, category, !!user.is_premium)
        db.prepare(`
          UPDATE sins
          SET atonement_reflection = ?,
              atonement_action = ?,
              atonement_affirmation = ?,
              atonement_insight = ?,
              atonement_status = 'complete'
          WHERE id = ?
        `).run(atonement.reflection, atonement.action, atonement.affirmation, atonement.insight || null, sinId)
      } catch (aiErr) {
        console.error('[Sins] Atonement generation failed:', aiErr.message)
        db.prepare(`UPDATE sins SET atonement_status = 'error' WHERE id = ?`).run(sinId)
      }

      const sin = db.prepare(`
        SELECT id, description, category, atonement_reflection, atonement_action,
               atonement_affirmation, atonement_insight, atonement_status, completed_at, created_at
        FROM sins WHERE id = ?
      `).get(sinId)

      res.status(201).json({ sin })
    } catch (err) {
      console.error('[Sins] Create error:', err)
      res.status(500).json({ error: 'Failed to log sin' })
    }
  }
)

// PATCH /api/sins/:id/notes
router.patch('/:id/notes', requireAuth, (req, res) => {
  const { id } = req.params
  const { notes } = req.body
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ error: 'Invalid sin ID' })
  }
  if (typeof notes !== 'string' || notes.length > 2000) {
    return res.status(400).json({ error: 'Notes must be a string under 2000 characters' })
  }
  try {
    const sin = db.prepare('SELECT id FROM sins WHERE id = ? AND user_id = ?').get(id, req.userId)
    if (!sin) return res.status(404).json({ error: 'Sin not found' })
    db.prepare('UPDATE sins SET notes = ? WHERE id = ?').run(notes || null, id)
    res.json({ notes: notes || null })
  } catch (err) {
    console.error('[Sins] Notes update error:', err)
    res.status(500).json({ error: 'Failed to save notes' })
  }
})

// PATCH /api/sins/:id/complete
router.patch('/:id/complete', requireAuth, (req, res) => {
  const { id } = req.params
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ error: 'Invalid sin ID' })
  }

  try {
    const sin = db.prepare(
      'SELECT id, completed_at FROM sins WHERE id = ? AND user_id = ?'
    ).get(id, req.userId)
    if (!sin) return res.status(404).json({ error: 'Sin not found' })

    const newValue = sin.completed_at ? null : new Date().toISOString()
    db.prepare('UPDATE sins SET completed_at = ? WHERE id = ?').run(newValue, id)
    res.json({ completed_at: newValue })
  } catch (err) {
    console.error('[Sins] Complete toggle error:', err)
    res.status(500).json({ error: 'Failed to update sin' })
  }
})

// DELETE /api/sins/:id
router.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params

  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ error: 'Invalid sin ID' })
  }

  try {
    // Check if user is premium
    const user = db.prepare('SELECT is_premium FROM users WHERE id = ?').get(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Block delete for free tier users
    if (!user.is_premium) {
      return res.status(403).json({
        error: 'Delete is only available for Premium subscribers',
        code: 'PREMIUM_ONLY',
      })
    }

    const sin = db.prepare('SELECT id FROM sins WHERE id = ? AND user_id = ?').get(id, req.userId)
    if (!sin) {
      return res.status(404).json({ error: 'Sin not found' })
    }

    db.prepare('DELETE FROM sins WHERE id = ? AND user_id = ?').run(id, req.userId)
    res.json({ message: 'Sin deleted' })
  } catch (err) {
    console.error('[Sins] Delete error:', err)
    res.status(500).json({ error: 'Failed to delete sin' })
  }
})

// GET /api/sins/stats
router.get('/stats', requireAuth, (req, res) => {
  try {
    const totalRow = db.prepare('SELECT COUNT(*) as count FROM sins WHERE user_id = ?').get(req.userId)
    const atonedRow = db.prepare('SELECT COUNT(*) as count FROM sins WHERE user_id = ? AND completed_at IS NOT NULL').get(req.userId)
    const byCategory = db.prepare(
      'SELECT category, COUNT(*) as count FROM sins WHERE user_id = ? GROUP BY category ORDER BY count DESC'
    ).all(req.userId)

    // Streak: consecutive days with at least one sin atoned, counting back from today
    const atonedDays = db.prepare(`
      SELECT DISTINCT date(completed_at) as day
      FROM sins
      WHERE user_id = ? AND completed_at IS NOT NULL
      ORDER BY day DESC
    `).all(req.userId)

    let streak = 0
    if (atonedDays.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      let cursor = new Date(today)
      for (const { day } of atonedDays) {
        const d = new Date(day)
        d.setHours(0, 0, 0, 0)
        if (d.getTime() === cursor.getTime()) {
          streak++
          cursor.setDate(cursor.getDate() - 1)
        } else {
          break
        }
      }
    }

    res.json({
      total: totalRow.count,
      atoned: atonedRow.count,
      by_category: byCategory,
      streak,
    })
  } catch (err) {
    console.error('[Sins] Stats error:', err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// GET /api/usage
router.get('/usage', requireAuth, (req, res) => {
  try {
    const user = db.prepare('SELECT is_premium FROM users WHERE id = ?').get(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const monthlyCount = getMonthlyCount(req.userId)
    const remaining = user.is_premium ? null : Math.max(0, FREE_TIER_LIMIT - monthlyCount)

    res.json({
      is_premium: !!user.is_premium,
      free_tier_limit: FREE_TIER_LIMIT,
      used_this_month: monthlyCount,
      free_tier_remaining: remaining,
    })
  } catch (err) {
    console.error('[Sins] Usage error:', err)
    res.status(500).json({ error: 'Failed to fetch usage' })
  }
})

export default router
