import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setMsg(''); setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMsg('Account created! You can now sign in.')
        setMode('login')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.brand}>
          <h1 style={s.title}>The <span style={s.green}>Verdict</span></h1>
          <p style={s.tagline}>The Business Reputation Index</p>
        </div>
        <h2 style={s.formTitle}>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit} style={s.form}>
          <input style={s.input} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={s.input} type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          {error && <p style={s.error}>{error}</p>}
          {msg && <p style={s.success}>{msg}</p>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p style={s.toggle}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button style={s.link} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMsg('') }}>
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F8F5', padding: 20 },
  card: { width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, border: '1px solid #E2E0DA', padding: '48px 40px' },
  brand: { textAlign: 'center', marginBottom: 32 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 600, margin: '0 0 8px', color: '#0E0E0E' },
  green: { color: '#1A3A2A' },
  tagline: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#6B6B6B', margin: 0 },
  formTitle: { fontSize: 18, fontWeight: 500, margin: '0 0 20px', color: '#0E0E0E', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { height: 48, border: '1.5px solid #E2E0DA', borderRadius: 10, padding: '0 16px', fontSize: 14, outline: 'none', background: '#FAFAF8', color: '#0E0E0E', fontFamily: 'inherit' },
  btn: { height: 50, background: '#1A3A2A', color: '#E8C84A', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 },
  error: { color: '#C94125', fontSize: 13, margin: 0 },
  success: { color: '#2D8A52', fontSize: 13, margin: 0 },
  toggle: { marginTop: 20, fontSize: 13, color: '#6B6B6B', textAlign: 'center' },
  link: { background: 'none', border: 'none', color: '#1A3A2A', cursor: 'pointer', fontWeight: 500, fontSize: 13, padding: 0, fontFamily: 'inherit' },
}
