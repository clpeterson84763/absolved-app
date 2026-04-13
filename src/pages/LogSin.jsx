import { useState } from 'react'
import { useAuth } from '../App.jsx'
import AtonePrompt from '../components/AtonePrompt.jsx'
import DoveAnimation from '../components/DoveAnimation.jsx'
import DoveCorners from '../components/DoveCorners.jsx'

async function redirectToCheckout(apiFetch, plan = 'monthly') {
  const res = await apiFetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  })
  const data = await res.json()
  if (data.url) window.location.href = data.url
}

const CATEGORIES = [
  { value: 'general', label: '✦ General' },
  { value: 'anger', label: '🔥 Anger' },
  { value: 'envy', label: '💚 Envy' },
  { value: 'pride', label: '👑 Pride' },
  { value: 'sloth', label: '😴 Sloth' },
  { value: 'greed', label: '💰 Greed' },
  { value: 'lust', label: '💫 Lust' },
  { value: 'gluttony', label: '🍽️ Gluttony' },
  { value: 'dishonesty', label: '🎭 Dishonesty' },
  { value: 'unkindness', label: '💔 Unkindness' },
  { value: 'neglect', label: '🌧️ Neglect' },
]

export default function LogSin({ onBack }) {
  const { apiFetch } = useAuth()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [loading, setLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('annual')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [limitReached, setLimitReached] = useState(false)

  const charCount = description.length
  const charLimit = 1000

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await apiFetch('/api/sins', {
        method: 'POST',
        body: JSON.stringify({ description: description.trim(), category }),
      })
      const data = await res.json()

      if (res.status === 403 && data.code === 'LIMIT_REACHED') {
        setLimitReached(true)
        return
      }
      if (!res.ok) {
        setError(data.error || 'Failed to log sin')
        return
      }

      setResult(data.sin)
    } catch (err) {
      if (err.message === 'Session expired') return
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (limitReached) {
    return (
      <div className="page">
        <DoveCorners position="both" />
        <nav className="top-nav">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <span className="nav-title">Log a Sin</span>
        </nav>
        <div className="paywall-card">
          <div className="paywall-icon">✨</div>
          <h2>You've used all 5 free logs this month</h2>
          <p>Upgrade to Premium for unlimited confessions, deeper guidance, and peace of mind — every day.</p>

          <ul className="paywall-features">
            <li>✓ Unlimited sin logs</li>
            <li>✓ Extended AI guidance (premium depth)</li>
            <li>✓ Private notes on each entry</li>
            <li>✓ Progress tracking & streaks</li>
            <li>✓ PDF export of your journey</li>
          </ul>

          {/* Plan toggle */}
          <div className="plan-toggle">
            <button
              className={`plan-btn ${selectedPlan === 'monthly' ? 'plan-btn-active' : ''}`}
              onClick={() => setSelectedPlan('monthly')}
            >
              Monthly<span className="plan-price">$4.99/mo</span>
            </button>
            <button
              className={`plan-btn ${selectedPlan === 'annual' ? 'plan-btn-active' : ''}`}
              onClick={() => setSelectedPlan('annual')}
            >
              Annual<span className="plan-price">$39.99/yr</span>
              <span className="plan-save">Save 33%</span>
            </button>
          </div>

          <button
            className="btn-premium"
            disabled={checkoutLoading}
            onClick={async () => {
              setCheckoutLoading(true)
              await redirectToCheckout(apiFetch, selectedPlan)
              setCheckoutLoading(false)
            }}
          >
            {checkoutLoading
              ? 'Redirecting to checkout...'
              : selectedPlan === 'annual'
              ? 'Get Premium — $39.99/yr'
              : 'Get Premium — $4.99/mo'}
          </button>
          <p className="paywall-note">Cancel anytime. Secure checkout via Stripe.</p>
          <button className="link-btn" onClick={onBack}>Return to Dashboard</button>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="page">
        <DoveCorners position="both" />
        <DoveAnimation />
        <nav className="top-nav">
          <button className="back-btn" onClick={onBack}>← Dashboard</button>
          <span className="nav-title">Atonement Guidance</span>
        </nav>
        <div className="result-page">
          <div className="result-header">
            <span className="result-icon">🕊️</span>
            <h2>Your path to peace</h2>
            <p className="result-sin-preview">"{result.description}"</p>
          </div>
          <AtonePrompt sin={result} />
          <button className="btn-secondary" onClick={onBack}>Return to Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <DoveCorners position="both" />
      <nav className="top-nav">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <span className="nav-title">Log a Sin</span>
      </nav>

      <div className="log-container">
        <div className="log-header">
          <h2>Confess & Be Guided</h2>
          <p>Speak honestly. This is a safe, private space for reflection.</p>
        </div>

        <form onSubmit={handleSubmit} className="log-form">
          {error && <div className="error-banner">{error}</div>}

          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="description">
              What's weighing on you?
              <span className={`char-count ${charCount > charLimit * 0.9 ? 'warn' : ''}`}>
                {charCount}/{charLimit}
              </span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what happened, how it made you feel, and what you wish you'd done differently..."
              rows={6}
              maxLength={charLimit}
              required
            />
          </div>

          <div className="ai-notice">
            <span>✦</span>
            <p>Claude AI will generate personalized, compassionate atonement guidance just for you.</p>
          </div>

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading || description.trim().length < 5}
          >
            {loading ? (
              <span className="loading-text">
                <span className="spinner-sm" /> Generating your guidance...
              </span>
            ) : (
              'Submit & Receive Guidance'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
