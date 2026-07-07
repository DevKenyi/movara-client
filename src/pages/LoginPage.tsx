import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import type { AuthUser } from '../types'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post<AuthUser>('/api/auth/login', { email, password })
      login(data)
      if (data.role === 'ADMIN') navigate('/admin/vendors')
      else navigate('/vendor/orders')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #095C46 0%, #053A2C 50%, #0A7A5C 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: '#fff',
        borderRadius: 20,
        padding: '36px 32px',
        boxShadow: '0 24px 48px -12px rgba(0,0,0,0.25)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#095C46',
            color: '#fff',
            fontWeight: 800,
            fontSize: 22,
            padding: '8px 18px',
            borderRadius: 12,
            letterSpacing: '-0.5px',
          }}>
            Movara
          </div>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 10 }}>
            Sign in to your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@restaurant.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                aria-label={showPass ? 'Hide password' : 'Show password'}
                aria-pressed={showPass}
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9CA3AF', padding: 2,
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20, marginTop: -8 }}>
            <a href="#" style={{ fontSize: 13, color: '#095C46', textDecoration: 'none', fontWeight: 500 }}>
              Forgot password?
            </a>
          </div>

          {error && (
            <div style={{
              background: '#FEE2E2', border: '1px solid #FCA5A5',
              borderRadius: 8, padding: '10px 14px',
              color: '#991B1B', fontSize: 13, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            type="submit"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
