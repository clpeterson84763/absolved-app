const CATEGORY_EMOJIS = {
  general: '✦',
  anger: '🔥',
  envy: '💚',
  pride: '👑',
  sloth: '😴',
  greed: '💰',
  lust: '💫',
  gluttony: '🍽️',
  dishonesty: '🎭',
  unkindness: '💔',
  neglect: '🌧️',
}

const BAR_COLORS = [
  'var(--accent)',
  '#e05c7a',
  '#f0a050',
  '#4caf87',
  '#60b8e8',
]

export default function SinStats({ stats }) {
  if (!stats || stats.total === 0) return null

  const pctAtoned = stats.total > 0
    ? Math.round((stats.atoned / stats.total) * 100)
    : 0

  const topCategories = (stats.by_category || []).slice(0, 5)
  const maxCount = topCategories.length > 0 ? topCategories[0].count : 1

  return (
    <div className="sin-analytics">
      <div className="analytics-title">Overview</div>

      {stats.streak > 0 && (
        <div className="streak-banner">
          <span className="streak-flame">🔥</span>
          <span className="streak-text">
            <strong>{stats.streak}-day</strong> atonement streak — keep it going!
          </span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Logged</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.atoned}</span>
          <span className="stat-label">Atoned</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{pctAtoned}%</span>
          <span className="stat-label">Resolved</span>
        </div>
      </div>

      {topCategories.length > 0 && (
        <div className="bar-chart">
          <div className="bar-chart-title">By Category</div>
          {topCategories.map((item, i) => {
            const widthPct = (item.count / maxCount) * 100
            const emoji = CATEGORY_EMOJIS[item.category] || '✦'
            const label = item.category.charAt(0).toUpperCase() + item.category.slice(1)
            const color = BAR_COLORS[i % BAR_COLORS.length]
            return (
              <div key={item.category} className="bar-row">
                <span className="bar-label">{emoji} {label}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${widthPct}%`, background: color }}
                  />
                </div>
                <span className="bar-count">{item.count}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
