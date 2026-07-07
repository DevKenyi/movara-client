import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import MenuItemCard from '../components/MenuItemCard'
import CartDrawer from '../components/CartDrawer'
import api from '../api/axios'
import type { Vendor, MenuItem } from '../types'
import { ShoppingBag } from 'lucide-react'

export default function CustomerMenuPage() {
  const { vendorSlug } = useParams<{ vendorSlug: string }>()
  const navigate = useNavigate()
  const { totalItems, totalPrice } = useCart()

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    if (!vendorSlug) return
    Promise.all([
      api.get<Vendor>(`/api/public/vendors/${vendorSlug}`),
      api.get<MenuItem[]>(`/api/public/vendors/${vendorSlug}/menu`),
    ])
      .then(([v, m]) => { setVendor(v.data); setMenu(m.data) })
      .catch(() => setError('Restaurant not found'))
      .finally(() => setLoading(false))
  }, [vendorSlug])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#095C46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
        <p style={{ fontSize: 14, opacity: 0.8 }}>Loading menu…</p>
      </div>
    </div>
  )

  if (error || !vendor) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <div style={{ textAlign: 'center', padding: 32 }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>😕</p>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Restaurant not found</h2>
        <p style={{ color: '#6B7280', marginTop: 8, fontSize: 14 }}>
          This QR code may be outdated. Please ask staff for help.
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F8FAFC', minHeight: '100vh', paddingBottom: totalItems > 0 ? 90 : 24 }}>
      {/* Hero header */}
      <div style={{ background: '#095C46', padding: '24px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {vendor.logoUrl ? (
            <img src={vendor.logoUrl} alt={vendor.name}
              style={{ width: 54, height: 54, borderRadius: 12, objectFit: 'cover', background: '#fff', flexShrink: 0 }} />
          ) : (
            <div style={{
              width: 54, height: 54, borderRadius: 12, background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
            }}>🍴</div>
          )}
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>{vendor.name}</h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4,
              background: vendor.isOpen ? 'rgba(255,255,255,0.2)' : '#FEE2E2',
              color: vendor.isOpen ? '#fff' : '#DC2626',
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: vendor.isOpen ? '#6EE7B7' : '#DC2626', display: 'inline-block' }} />
              {vendor.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
        {vendor.description && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 10, lineHeight: 1.5 }}>
            {vendor.description}
          </p>
        )}
      </div>

      {/* Menu */}
      <div style={{ padding: '16px 16px 0' }}>
        {!vendor.isOpen && (
          <div style={{
            background: '#FEF3C7', border: '1px solid #FDE68A',
            borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#92400E',
          }}>
            ⚠️ This restaurant is currently closed. Ordering is unavailable.
          </div>
        )}

        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#111827' }}>Menu</h2>

        {menu.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🍽️</p>
            <p style={{ fontSize: 14 }}>No items available right now</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {menu.map(item => <MenuItemCard key={item.id} item={item} />)}
          </div>
        )}
      </div>

      {/* Sticky cart bar */}
      {totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          style={{
            position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)', maxWidth: 448,
            background: '#095C46', color: '#fff', border: 'none', borderRadius: 14,
            padding: '14px 20px', cursor: 'pointer', zIndex: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(9,92,70,0.35)',
          }}
        >
          <span style={{
            background: 'rgba(255,255,255,0.2)', borderRadius: 8,
            padding: '2px 10px', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <ShoppingBag size={13} />
            {totalItems} item{totalItems > 1 ? 's' : ''}
          </span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>View Cart</span>
          <span style={{ fontWeight: 800, fontSize: 15 }}>
            ₦{(totalPrice * 1.1).toLocaleString()}
          </span>
        </button>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          if (!vendor.isOpen) return
          setCartOpen(false)
          navigate(`/r/${vendorSlug}/checkout`)
        }}
      />
    </div>
  )
}
