import { useState, useEffect, createContext, useContext } from 'react'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LogSin from './pages/LogSin.jsx'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export default function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [page, setPage] = useState('landing')
  const [loading, setLoading] = useState(true)
  const [upgradeSuccess, setUpgradeSuccess] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem('absolved_token')
    const savedUser = localStorage.getItem('absolved_user')
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        setPage('dashboard')
      } catch {
        localStorage.removeItem('absolved_token')
        localStorage.removeItem('absolved_user')
      }
    }

    // Detect Stripe redirect back
    const params = new URLSearchParams(window.location.search)
    if (params.get('upgraded') === 'true') {
      setUpgradeSuccess(true)
      window.history.replaceState({}, '', '/')
    }

    setLoading(false)
  }, [])

  function login(newToken, newUser) {
    localStorage.setItem('absolved_token', newToken)
    localStorage.setItem('absolved_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    setPage('dashboard')
  }

  function logout() {
    localStorage.removeItem('absolved_token')
    localStorage.removeItem('absolved_user')
    setToken(null)
    setUser(null)
    setPage('landing')
  }

  async function apiFetch(path, options = {}) {
    const res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
    if (res.status === 401) {
      logout()
      throw new Error('Session expired')
    }
    return res
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  const auth = { user, token, login, logout, apiFetch, setPage }

  return (
    <AuthContext.Provider value={auth}>
      <div className="app">
        {upgradeSuccess && (
          <div className="upgrade-success-banner">
            ✨ Welcome to Premium! Your account has been upgraded.
            <button onClick={() => setUpgradeSuccess(false)}>✕</button>
          </div>
        )}
        {!user ? (
          <>
            {page === 'landing' && <Landing onLogin={() => setPage('login')} onSignup={() => setPage('signup')} />}
            {page === 'login' && <Login onSwitch={() => setPage('signup')} onBack={() => setPage('landing')} />}
            {page === 'signup' && <Signup onSwitch={() => setPage('login')} onBack={() => setPage('landing')} />}
          </>
        ) : (
          <>
            {page === 'dashboard' && <Dashboard onLogNew={() => setPage('log')} justUpgraded={upgradeSuccess} />}
            {page === 'log' && <LogSin onBack={() => setPage('dashboard')} />}
          </>
        )}
      </div>
    </AuthContext.Provider>
  )
}
