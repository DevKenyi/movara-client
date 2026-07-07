import { useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import api from '../api/axios'
import { ChevronLeft, Lock } from 'lucide-react'

export default function CheckoutPage() {
  const { vendorSlug } = useParams<{ vendorSlug: string }>()
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCart()

  const [name, setName]     = useState('')
  const [phone, setPhone]   = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const serviceCharge = totalPrice * 0.10
  const total = totalPrice + serviceCharge

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (items.length === 0) { setError('Your cart is empty'); return }
    setError('')
    setLoading(true)
    try {
      const { data: orderData } = await api.post<{ orderId: string; paymentReference: string }>(
        '/api/public/orders',
        {
          vendorSlug,
          customerName: name,
          customerPhone: phone,
          items: items.map(i => ({ menuItemId: i.menuItem.id, quantity: i.quantity })),
        }
      )
      const { data: payData } = await api.post<{ paymentLink: string; reference: string }>(
        '/api/payments/initiate',
        { orderId: orderData.orderId }
      )
      clearCart()
      window.open(payData.paymentLink, '_blank')
      navigate(`/order/${orderData.orderId}/status`)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F5F3EE', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#095C46', padding: '20px 20px 20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 9999,
            color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 12px', fontSize: 13, fontWeight: 500, marginBottom: 14,
          }}
        >
          <ChevronLeft size={15} /> Back to menu
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>Checkout</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
          Review your order and enter your details
        </p>
      </div>

      <div style={{ padding: '16px 16px 32px' }}>
        {/* Order summary */}
        <div className="surface-card" style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Order Summary
          </h3>
          {items.map(({ menuItem, quantity }) => (
            <div key={menuItem.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 7 }}>
              <span style={{ color: '#6B7280' }}>{menuItem.name} × {quantity}</span>
              <span style={{ fontWeight: 600 }}>₦{(Number(menuItem.price) * quantity).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #E5E7EB', marginTop: 12, paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 5 }}>
              <span>Subtotal</span><span>₦{totalPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 10 }}>
              <span>Service charge (10%)</span><span>₦{serviceCharge.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}>
              <span>Total</span>
              <span style={{ color: '#095C46' }}>₦{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Customer details */}
        <div className="surface-card" style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
            Your Details
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Ada Okonkwo" required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 08012345678" required
              />
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8,
                padding: '10px 12px', marginBottom: 14, color: '#DC2626', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} type="submit" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Processing…</>
                : `Pay ₦${total.toLocaleString()}`}
            </button>
          </form>
        </div>

        <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Lock size={12} /> Payments secured by Flutterwave
        </p>
      </div>
    </div>
  )
}
