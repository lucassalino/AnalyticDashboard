import { useState, type FormEvent } from 'react'
import { LockKeyhole } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError('Credenciais inválidas.')
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-glass">
        <div
          style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <LockKeyhole size={18} color="rgba(255,255,255,0.75)" />
        </div>

        <h1
          style={{
            textAlign: 'center',
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '0.25rem',
          }}
        >
          AnalyticDashboard
        </h1>
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.45)',
            marginBottom: '1.75rem',
          }}
        >
          Acesso restrito · ServiceFlow
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'A entrar…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
