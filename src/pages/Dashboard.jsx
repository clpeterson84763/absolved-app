import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../App.jsx'
import AtonePrompt from '../components/AtonePrompt.jsx'
import SinStats from '../components/SinStats.jsx'

const CATEGORY_LABELS = {
  general: '✦ General', anger: '🔥 Anger', envy: '💚 Envy',
  pride: '👑 Pride', sloth: '😴 Sloth', greed: '💰 Greed',
  lust: '💫 Lust', gluttony: '🍽️ Gluttony', dishonesty: '🎭 Dishonesty',
  unkindness: '💔 Unkindness', neglect: '🌧️ Neglect',
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Dashboard({ onLogNew, justUpgraded }) {
  const { user, logout, apiFetch } = useAuth()
  const [sins, setSins] = useState([])
  const [usage, setUsage] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [completingId, setCompletingId] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  async function handleUpgrade(plan = 'annual') {
    setCheckoutLoading(true)
    try {
      const res = await apiFetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setError('Failed to start checkout')
    } finally {
      setCheckoutLoading(false)
    }
  }

  async function handleBillingPortal() {
    try {
      const res = await apiFetch('/api/stripe/portal')
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setError('Failed to open billing portal')
    }
  }

  const fetchData = useCallback(async () => {
    try {
      const [sinsRes, usageRes, statsRes] = await Promise.all([
        apiFetch('/api/sins'),
        apiFetch('/api/sins/usage'),
        apiFetch('/api/sins/stats'),
      ])
      if (sinsRes.ok) {
        const data = await sinsRes.json()
        setSins(data.sins || [])
      }
      if (usageRes.ok) {
        const data = await usageRes.json()
        setUsage(data)
      }
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (err) {
      if (err.message !== 'Session expired') {
        setError('Failed to load your data')
      }
    } finally {
      setLoading(false)
    }
  }, [apiFetch])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!justUpgraded) return
    const timer = setTimeout(() => fetchData(), 2000)
    return () => clearTimeout(timer)
  }, [justUpgraded, fetchData])

  async function handleDelete(id) {
    if (!window.confirm('Remove this entry from your log?')) return
    setDeletingId(id)
    try {
      const res = await apiFetch(`/api/sins/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSins(prev => prev.filter(s => s.id !== id))
        if (expandedId === id) setExpandedId(null)
        const usageRes = await apiFetch('/api/sins/usage')
        if (usageRes.ok) setUsage(await usageRes.json())
      }
    } catch {
      setError('Failed to delete entry')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleComplete(id) {
    setCompletingId(id)
    try {
      const res = await apiFetch(`/api/sins/${id}/complete`, { method: 'PATCH' })
      if (res.ok) {
        const { completed_at } = await res.json()
        setSins(prev => prev.map(s => s.id === id ? { ...s, completed_at } : s))
      }
    } catch {
      setError('Failed to update entry')
    } finally {
      setCompletingId(null)
    }
  }

  const limitReached = usage && !usage.is_premium && usage.free_tier_remaining === 0

  return (
    <div className="page dashboard">
      <nav className="top-nav">
        <div className="nav-brand">
          <span>🕊️</span>
          <span className="nav-title">Absolved</span>
        </div>
        <div className="nav-actions">
          <span className="nav-user">{user.email}</span>
          <button className="link-btn" onClick={logout}>Sign out</button>
        </div>
      </nav>

      {usage && (
        <div className={`usage-banner ${limitReached ? 'usage-limit' : usage.is_premium ? 'usage-premium' : ''}`}>
          {usage.is_premium ? (
            <span>
              ✨ Premium — Unlimited confessions &nbsp;·&nbsp;
              <button className="link-btn" onClick={handleBillingPortal}>Manage billing</button>
            </span>
          ) : limitReached ? (
            <span>
              🔒 <strong>5/5 logs used this month</strong> —
              <button className="link-btn upgrade-link" onClick={handleUpgrade} disabled={checkoutLoading}>
                {checkoutLoading ? ' Opening checkout...' : ' Upgrade to Premium'}
              </button>
            </span>
          ) : (
            <span>{usage.free_tier_remaining} of {usage.free_tier_limit} free logs remaining this month</span>
          )}
        </div>
      )}

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h2>Your Journey</h2>
            <p>{sins.length === 0 ? 'Your log is empty' : `${sins.length} entr${sins.length === 1 ? 'y' : 'ies'} recorded`}</p>
          </div>
          <div className="dashboard-header-actions">
            {sins.length > 0 && (
              <button className="btn-export" onClick={() => window.print()} title="Export as PDF">
                ↓ PDF
              </button>
            )}
            <button
              className={`btn-primary ${limitReached ? 'btn-disabled' : ''}`}
              onClick={limitReached ? undefined : onLogNew}
              disabled={limitReached}
              title={limitReached ? 'Upgrade to log more' : undefined}
            >
              + Log a Sin
            </button>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {!loading && sins.length > 0 && <SinStats stats={stats} />}

        {loading ? (
          <div className="center-content">
            <div className="spinner" />
            <p>Loading your journey...</p>
          </div>
        ) : sins.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🌿</span>
            <h3>Your slate is clean</h3>
            <p>When something weighs on your conscience, log it here and receive compassionate guidance.</p>
            <button className="btn-primary" onClick={onLogNew}>Log your first entry</button>
          </div>
        ) : (
          <div className="sins-list">
            {sins.map(sin => (
              <div key={sin.id} className={`sin-card ${sin.completed_at ? 'sin-card-completed' : ''}`}>
                <div className="sin-header" onClick={() => setExpandedId(expandedId === sin.id ? null : sin.id)}>
                  <div className="sin-meta">
                    <span className="sin-category">{CATEGORY_LABELS[sin.category] || sin.category}</span>
                    <span className="sin-date">{formatDate(sin.created_at)}</span>
                    {sin.completed_at && <span className="atoned-badge">🕊️ Atoned</span>}
                  </div>
                  <div className="sin-row">
                    <p className="sin-description">{sin.description}</p>
                    <div className="sin-actions">
                      {!sin.completed_at && (
                        <span className={`status-badge status-${sin.atonement_status}`}>
                          {sin.atonement_status === 'complete' ? '✓ Absolved' :
                           sin.atonement_status === 'error' ? '⚠ Error' : '⏳ Pending'}
                        </span>
                      )}
                      <button className="expand-btn" aria-label={expandedId === sin.id ? 'Collapse' : 'Expand'}>
                        {expandedId === sin.id ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedId === sin.id && (
                  <div className="sin-expanded">
                    <AtonePrompt
                      sin={sin}
                      onNotesUpdate={(id, notes) =>
                        setSins(prev => prev.map(s => s.id === id ? { ...s, notes } : s))
                      }
                    />

                    {sin.atonement_status === 'complete' && (
                      <button
                        className={`complete-btn ${sin.completed_at ? 'complete-btn-done' : ''}`}
                        onClick={() => handleComplete(sin.id)}
                        disabled={completingId === sin.id}
                      >
                        {completingId === sin.id
                          ? 'Saving...'
                          : sin.completed_at
                          ? '↩ Mark as not yet atoned'
                          : '✓ Mark as atoned'}
                      </button>
                    )}

                    {usage?.is_premium && (
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(sin.id)}
                        disabled={deletingId === sin.id}
                      >
                        {deletingId === sin.id ? 'Removing...' : 'Remove entry'}
                      </button>
                    )}
                    {!usage?.is_premium && (
                      <button
                        className="premium-feature-hint"
                        onClick={() => handleUpgrade('annual')}
                        disabled={checkoutLoading}
                      >
                        💎 Delete is available for Premium members — Upgrade now
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
