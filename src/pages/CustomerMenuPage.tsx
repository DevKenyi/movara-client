import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import MenuItemCard from '../components/MenuItemCard'
import CartDrawer from '../components/CartDrawer'
import api from '../api/axios'
import type { Vendor, MenuItem } from '../types'

function MenuContent() {
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
      .then(([vRes, mRes]) => { setVendor(vRes.data); setMenu(mRes.data) })
      .catch(() => setError('Restaurant not found'))
      .finally(() => setLoading(false))
  }, [vendorSlug])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 32, height: 32, borderColor: 'var(--green-start)', borderTopColor: 'var(--green-end)', margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading menu…</p>
      </div>
    </div>
  )

  if (error || !vendor) return (
    <div style={{ textAlign: 'center', padding: 48 }}>
      <p style={{ fontSize: 40, marginBottom: 12 }}>😕</p>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>Restaurant Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>
        The QR code may be outdated or incorrect.
      </p>
    </div>
  )

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: totalItems > 0 ? 100 : 24 }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-start), var(--green-end))',
        padding: '28px 20px 24px', color: '#fff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {vendor.logoUrl ? (
            <img src={vendor.logoUrl} alt={vendor.name}
              style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', background: '#fff' }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🍴</div>
          )}
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{vendor.name}</h1>
            <span className={vendor.isOpen ? 'badge-open' : 'badge-closed'}
              style={{ background: vendor.isOpen ? 'rgba(255,255,255,0.25)' : '#FEE2E2',
                color: vendor.isOpen ? '#fff' : '#DC2626', marginTop: 4, display: 'inline-block' }}>
              {vendor.isOpen ? '● Open' : '● Closed'}
            </span>
          </div>
        </div>
        {vendor.description && (
          <p style={{ fontSize: 13, marginTop: 10, opacity: 0.9 }}>{vendor.description}</p>
        )}
      </div>

      {/* Menu */}
      <div style={{ padding: '16px 16px 0' }}>
        {!vendor.isOpen && (
          <div style={{ background: '#FEF3CD', border: '1px solid #F59E0B', borderRadius: 8,
            padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#92400E' }}>
            ⚠️ This restaurant is currently closed. You can browse the menu but cannot order.
          </div>
        )}

        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Menu</h2>

        {menu.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '32px 0', fontSize: 14 }}>
            No items available right now
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {menu.map((item) => <MenuItemCard key={item.id} item={item} />)}
          </div>
        )}
      </div>

      {/* Sticky cart bar */}
      {totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="btn-primary"
          style={{
            position: 'fixed', bottom: 16, left: 16, right: 16, maxWidth: 448,
            margin: '0 auto', zIndex: 30, justifyContent: 'space-between',
            padding: '14px 20px', borderRadius: 14,
            boxShadow: '0 8px 24px rgba(63,138,94,0.3)'
          }}
        >
          <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 6, padding: '2px 8px', fontSize: 13 }}>
            {totalItems} item{totalItems > 1 ? 's' : ''}
          </span>
          <span>View Cart</span>
          <span style={{ fontWeight: 800 }}>₦{(totalPrice * 1.1).toLocaleString()}</span>
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

export default function CustomerMenuPage() {
  return <MenuContent />
}
