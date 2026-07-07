import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

interface NavItem { label: string; to: string; icon: string }

const VENDOR_NAV: NavItem[] = [
  { label: 'Orders',    to: '/vendor/orders', icon: '📋' },
  { label: 'Menu',      to: '/vendor/menu',   icon: '🍽️' },
  { label: 'QR Code',   to: '/vendor/qr',     icon: '📱' },
]
const ADMIN_NAV: NavItem[] = [
  { label: 'Vendors',   to: '/admin/vendors', icon: '🏪' },
  { label: 'Orders',    to: '/admin/orders',  icon: '📋' },
]

interface Props { children: ReactNode }

export default function DashboardLayout({ children }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const nav = user?.role === 'ADMIN' ? ADMIN_NAV : VENDOR_NAV

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--white)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--green-start), var(--green-end))',
            color: '#fff', fontWeight: 800, fontSize: 20, padding: '8px 14px',
            borderRadius: 8, display: 'inline-block'
          }}>Movara</div>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            {user?.role === 'ADMIN' ? 'Admin' : 'Vendor'} Dashboard
          </p>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500,
                marginBottom: 4,
                background: isActive ? 'linear-gradient(135deg, #E6F7EE, #D1F0E0)' : 'transparent',
                color: isActive ? 'var(--green-end)' : 'var(--text-secondary)',
              })}>
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '0 12px' }}>
          <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 8, marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600 }}>{user?.email}</p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user?.role}</p>
          </div>
          <button className="btn-secondary" style={{ width: '100%' }} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 28, overflowY: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}
