import { useState, useCallback } from 'react'
import { useAuth } from '../App.jsx'

export default function AtonePrompt({ sin, onNotesUpdate }) {
  const { apiFetch } = useAuth()
  const [notes, setNotes] = useState(sin.notes || '')
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)

  const saveNotes = useCallback(async (value) => {
    setNotesSaving(true)
    setNotesSaved(false)
    try {
      const res = await apiFetch(`/api/sins/${sin.id}/notes`, {
        method: 'PATCH',
        body: JSON.stringify({ notes: value }),
      })
      if (res.ok) {
        setNotesSaved(true)
        onNotesUpdate?.(sin.id, value)
        setTimeout(() => setNotesSaved(false), 2000)
      }
    } catch {
      // fail silently
    } finally {
      setNotesSaving(false)
    }
  }, [apiFetch, sin.id, onNotesUpdate])

  if (!sin) return null

  const isPending = sin.atonement_status === 'pending'
  const isError = sin.atonement_status === 'error'

  if (isPending) {
    return (
      <div className="atone-card atone-pending">
        <div className="spinner" />
        <p>Generating your guidance...</p>
      </div>
    )
  }

  if (isError || (!sin.atonement_reflection && !sin.atonement_action)) {
    return (
      <div className="atone-card atone-error">
        <p>Guidance could not be generated at this time. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="atone-card">
      {sin.atonement_reflection && (
        <div className="atone-section">
          <div className="atone-label">
            <span className="atone-icon">🪞</span>
            <span>Reflection</span>
          </div>
          <p>{sin.atonement_reflection}</p>
        </div>
      )}

      {sin.atonement_action && (
        <div className="atone-section">
          <div className="atone-label">
            <span className="atone-icon">🌱</span>
            <span>Suggested Action</span>
          </div>
          <p>{sin.atonement_action}</p>
        </div>
      )}

      {sin.atonement_affirmation && (
        <div className="atone-section atone-affirmation">
          <div className="atone-label">
            <span className="atone-icon">✨</span>
            <span>Affirmation</span>
          </div>
          <blockquote>{sin.atonement_affirmation}</blockquote>
        </div>
      )}

      {/* Premium-only insight */}
      {sin.atonement_insight && (
        <div className="atone-section atone-insight">
          <div className="atone-label">
            <span className="atone-icon">🔮</span>
            <span>Deeper Insight</span>
            <span className="premium-badge">Premium</span>
          </div>
          <p>{sin.atonement_insight}</p>
        </div>
      )}

      {/* Private notes */}
      <div className="atone-section atone-notes">
        <div className="atone-label">
          <span className="atone-icon">📝</span>
          <span>Private Notes</span>
          {notesSaving && <span className="notes-status">Saving...</span>}
          {notesSaved && <span className="notes-status notes-saved">Saved ✓</span>}
        </div>
        <textarea
          className="notes-textarea"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={e => saveNotes(e.target.value)}
          placeholder="Add your own thoughts, feelings, or reflections here..."
          rows={3}
          maxLength={2000}
        />
      </div>
    </div>
  )
}
