import { useState, FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import api from '../api/axios'

export default function CheckoutPage() {
  const { vendorSlug } = useParams<{ vendorSlug: string }>()
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCart()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const SERVICE = 0.1
  const serviceCharge = totalPrice * SERVICE
  const total = totalPrice + serviceCharge

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (items.length === 0) { setError('Your cart is empty'); return }
    setError('')
    setLoading(true)

    try {
      // 1. Create order
      const { data: orderData } = await api.post<{ orderId: string; paymentReference: string }>(
        '/api/public/orders',
        {
          vendorSlug,
          customerName: name,
          customerPhone: phone,
          items: items.map((i) => ({ menuItemId: i.menuItem.id, quantity: i.quantity })),
        }
      )

      // 2. Initiate payment
      const { data: payData } = await api.post<{ paymentLink: string; reference: string }>(
        '/api/payments/initiate',
        { orderId: orderData.orderId }
      )

      clearCart()

      // 3. Open Flutterwave payment link
      window.open(payData.paymentLink, '_blank')

      // 4. Redirect to tracker (polls status)
      navigate(`/order/${orderData.orderId}/status`)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
        ← Back to menu
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Checkout</h1>

      {/* Order summary */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Order Summary</h3>
        {items.map(({ menuItem, quantity }) => (
          <div key={menuItem.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: 'var(--text-secondary)' }}>{menuItem.name} × {quantity}</span>
            <span style={{ fontWeight: 600 }}>₦{(menuItem.price * quantity).toLocaleString()}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 10, paddingTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
            <span>Subtotal</span><span>₦{totalPrice.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
            <span>Service charge (10%)</span><span>₦{serviceCharge.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
            <span>Total</span><span>₦{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Customer details form */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Your Details</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Ada Okonkwo" required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 08012345678" required />
          </div>

          {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button className="btn-primary" style={{ width: '100%' }} type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Processing…</> : `Pay ₦${total.toLocaleString()}`}
          </button>
        </form>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
        🔒 Secured by Flutterwave
      </p>
    </div>
  )
}
