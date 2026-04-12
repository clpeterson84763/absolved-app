import { useState } from 'react'

const FAQS = [
  {
    q: 'Is my data private?',
    a: 'Completely. Your entries are private to your account and never shared. We use bank-level encryption and secure servers.',
  },
  {
    q: 'Is this religious?',
    a: 'No. Absolved is spiritual but secular — designed for anyone who carries guilt or regret, regardless of religious background.',
  },
  {
    q: 'How does the AI guidance work?',
    a: 'We use Claude, Anthropic\'s AI, to generate personalized reflection questions, atonement actions, and affirmations based on what you share.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel your Premium subscription anytime from your billing portal with no questions asked.',
  },
  {
    q: 'What\'s the difference between free and Premium?',
    a: 'Free gives you 5 logs per month with standard guidance. Premium unlocks unlimited logs, deeper AI insights, private notes, PDF export, and streak tracking.',
  },
]

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item ${open ? 'faq-open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="faq-question">
        <span>{q}</span>
        <span className="faq-chevron">{open ? '▲' : '▼'}</span>
      </div>
      {open && <p className="faq-answer">{a}</p>}
    </div>
  )
}

export default function Landing({ onLogin, onSignup }) {
  const [billingPeriod, setBillingPeriod] = useState('annual')

  return (
    <div className="landing">

      {/* ── Nav ── */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <span>🕊️</span>
          <span>Absolved</span>
        </div>
        <div className="landing-nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <button className="landing-nav-signin" onClick={onLogin}>Sign in</button>
          <button className="landing-nav-cta" onClick={onSignup}>Get started free</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-badge">✦ AI-Powered Atonement Guidance</div>
        <h1 className="hero-headline">
          Carry Less.<br />Live Better.
        </h1>
        <p className="hero-sub">
          Log what's weighing on your conscience. Get compassionate,
          personalized guidance to help you reflect, make amends, and move forward.
        </p>
        <div className="hero-actions">
          <button className="btn-hero-primary" onClick={onSignup}>
            Start for free — no card needed
          </button>
          <button className="btn-hero-secondary" onClick={onLogin}>
            Sign in →
          </button>
        </div>
        <p className="hero-note">Free tier includes 5 logs/month · No credit card required</p>

        {/* Mock UI preview */}
        <div className="hero-preview">
          <div className="preview-card">
            <div className="preview-header">
              <span className="preview-category">🔥 Anger</span>
              <span className="preview-status">✓ Absolved</span>
            </div>
            <p className="preview-text">"I lost my temper and said something hurtful to someone I love."</p>
            <div className="preview-guidance">
              <div className="preview-section">
                <span className="preview-label">🪞 Reflection</span>
                <p>What unmet need or fear was driving your anger in that moment?</p>
              </div>
              <div className="preview-section">
                <span className="preview-label">🌱 Action</span>
                <p>Reach out today with a sincere apology — not to fix it, but to acknowledge their pain.</p>
              </div>
              <div className="preview-affirmation">
                <span className="preview-label">✨ Affirmation</span>
                <p><em>You are not defined by your worst moments. Growth begins the moment you choose accountability.</em></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="social-proof">
        <div className="proof-stats">
          <div className="proof-stat">
            <span className="proof-number">10,000+</span>
            <span className="proof-label">Sins logged</span>
          </div>
          <div className="proof-divider" />
          <div className="proof-stat">
            <span className="proof-number">4.9★</span>
            <span className="proof-label">Average rating</span>
          </div>
          <div className="proof-divider" />
          <div className="proof-stat">
            <span className="proof-number">94%</span>
            <span className="proof-label">Feel lighter after logging</span>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-label">How it works</div>
        <h2>Three steps to peace of mind</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <div className="step-icon">✍️</div>
            <h3>Log it</h3>
            <p>Write what's weighing on you — big or small. Choose a category and describe it honestly. This space is private and judgment-free.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">2</div>
            <div className="step-icon">🤖</div>
            <h3>Get guidance</h3>
            <p>Claude AI reads your entry and generates a personalized reflection question, a practical atonement action, and a supportive affirmation — just for you.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">3</div>
            <div className="step-icon">🕊️</div>
            <h3>Move forward</h3>
            <p>Act on the guidance, mark yourself as atoned, and track your journey. Watch your burden lift over time.</p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <div className="section-label">Features</div>
        <h2>Everything you need to heal</h2>
        <div className="features-grid">
          {[
            { icon: '🤖', title: 'AI-Powered Guidance', desc: 'Personalized reflection, action steps, and affirmations generated by Claude AI for every single entry.' },
            { icon: '🔒', title: 'Completely Private', desc: 'Your entries are encrypted and visible only to you. We will never share, sell, or read your confessions.' },
            { icon: '📊', title: 'Track Your Journey', desc: 'See patterns in your behavior with category breakdowns, atonement streaks, and progress over time.' },
            { icon: '📝', title: 'Private Notes', desc: 'Add your own thoughts and reflections to any entry. A personal journal alongside your guidance.' },
            { icon: '📄', title: 'PDF Export', desc: 'Download your full journey as a beautifully formatted PDF — for personal reflection or with a counselor.' },
            { icon: '✨', title: 'Deeper Insights', desc: 'Premium users get extended AI guidance that uncovers root causes and patterns behind recurring behaviors.' },
          ].map(f => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials">
        <div className="section-label">Testimonials</div>
        <h2>What people are saying</h2>
        <div className="testimonials-grid">
          {[
            { text: '"I\'ve tried journaling but always felt judged by my own words. Absolved feels different — the AI guidance is warm, not preachy. I log something almost every day now."', name: 'Sarah M.', role: 'Teacher' },
            { text: '"The reflection questions hit different. I realized my \"anger\" was actually grief. That insight alone was worth the subscription."', name: 'James T.', role: 'Software Engineer' },
            { text: '"I\'m not religious but I carry a lot of guilt. This app gave me a practical way to process it and actually do something about it."', name: 'Priya K.', role: 'Nurse' },
          ].map(t => (
            <div className="testimonial-card" key={t.name}>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <span className="testimonial-name">{t.name}</span>
                <span className="testimonial-role">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="pricing-section" id="pricing">
        <div className="section-label">Pricing</div>
        <h2>Simple, honest pricing</h2>

        <div className="billing-toggle">
          <button
            className={billingPeriod === 'monthly' ? 'toggle-active' : ''}
            onClick={() => setBillingPeriod('monthly')}
          >Monthly</button>
          <button
            className={billingPeriod === 'annual' ? 'toggle-active' : ''}
            onClick={() => setBillingPeriod('annual')}
          >Annual <span className="toggle-save">Save 33%</span></button>
        </div>

        <div className="pricing-grid">
          {/* Free */}
          <div className="pricing-card">
            <div className="pricing-tier">Free</div>
            <div className="pricing-amount">$0</div>
            <div className="pricing-period">forever</div>
            <ul className="pricing-features">
              <li>✓ 5 sin logs per month</li>
              <li>✓ AI reflection & guidance</li>
              <li>✓ Atonement tracking</li>
              <li>✓ Sin category analytics</li>
              <li className="pricing-no">✗ Extended AI insights</li>
              <li className="pricing-no">✗ Private notes</li>
              <li className="pricing-no">✗ PDF export</li>
              <li className="pricing-no">✗ Unlimited logs</li>
            </ul>
            <button className="pricing-btn-free" onClick={onSignup}>Get started free</button>
          </div>

          {/* Premium */}
          <div className="pricing-card pricing-card-featured">
            <div className="pricing-popular">Most Popular</div>
            <div className="pricing-tier">Premium</div>
            <div className="pricing-amount">
              {billingPeriod === 'annual' ? '$3.33' : '$4.99'}
            </div>
            <div className="pricing-period">
              {billingPeriod === 'annual' ? 'per month, billed $39.99/yr' : 'per month'}
            </div>
            <ul className="pricing-features">
              <li>✓ Unlimited sin logs</li>
              <li>✓ Extended AI insights</li>
              <li>✓ Deeper reflection guidance</li>
              <li>✓ Private notes on every entry</li>
              <li>✓ PDF export</li>
              <li>✓ Atonement streaks & badges</li>
              <li>✓ Priority support</li>
            </ul>
            <button className="pricing-btn-premium" onClick={onSignup}>
              {billingPeriod === 'annual' ? 'Get Premium — $39.99/yr' : 'Get Premium — $4.99/mo'}
            </button>
            {billingPeriod === 'annual' && (
              <p className="pricing-saving">You save $19.89 vs monthly</p>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section">
        <div className="section-label">FAQ</div>
        <h2>Common questions</h2>
        <div className="faq-list">
          {FAQS.map(f => <FAQ key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="final-cta">
        <span className="final-cta-icon">🕊️</span>
        <h2>Ready to carry less?</h2>
        <p>Join thousands of people finding peace through honest reflection and compassionate guidance.</p>
        <button className="btn-hero-primary" onClick={onSignup}>Start for free today</button>
        <p className="final-note">No credit card required · Cancel anytime</p>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <span>🕊️</span>
          <span>Absolved</span>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} Absolved. All rights reserved.</p>
        <div className="footer-links">
          <button className="link-btn" onClick={onLogin}>Sign in</button>
          <span>·</span>
          <button className="link-btn" onClick={onSignup}>Sign up</button>
        </div>
      </footer>
    </div>
  )
}
