import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import type { AuthUser } from '../types'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 16
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--green-start), var(--green-end))',
            color: '#fff', fontWeight: 800, fontSize: 26, padding: '8px 20px',
            borderRadius: 10, display: 'inline-block'
          }}>Movara</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
            Sign in to your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required />
          </div>

          {error && (
            <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}

          <button className="btn-primary" style={{ width: '100%' }} type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
