import { useCart } from '../contexts/CartContext'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

export default function CartDrawer({ open, onClose, onCheckout }: Props) {
  const { items, updateQuantity, totalPrice } = useCart()
  const serviceCharge = totalPrice * 0.10
  const total = totalPrice + serviceCharge

  return (
    <>
      {open && (
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40,
        }} />
      )}

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: '#fff',
        borderRadius: '20px 20px 0 0',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
        maxHeight: '82vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E7EB' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 20px 10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={18} color="#095C46" />
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Your Cart</h2>
          </div>
          <button onClick={onClose} style={{
            background: '#F3F4F6', border: 'none', borderRadius: '50%',
            width: 30, height: 30, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }} className="scrollbar-hide">
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF', fontSize: 14 }}>
              <ShoppingBag size={36} style={{ margin: '0 auto 10px', opacity: 0.3, display: 'block' }} />
              Your cart is empty
            </div>
          ) : (
            items.map(({ menuItem, quantity }) => (
              <div key={menuItem.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0', borderBottom: '1px solid #F3F4F6',
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{menuItem.name}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    ₦{Number(menuItem.price).toLocaleString()} ea.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => updateQuantity(menuItem.id, quantity - 1)} style={{
                    width: 26, height: 26, borderRadius: '50%', border: '1.5px solid #E5E7EB',
                    background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Minus size={12} /></button>
                  <span style={{ fontWeight: 700, fontSize: 14, minWidth: 18, textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => updateQuantity(menuItem.id, quantity + 1)} style={{
                    width: 26, height: 26, borderRadius: '50%', background: '#095C46',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}><Plus size={12} /></button>
                </div>
                <p style={{ fontWeight: 700, fontSize: 14, minWidth: 72, textAlign: 'right' }}>
                  ₦{(Number(menuItem.price) * quantity).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '14px 20px 28px', borderTop: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
              <span>Subtotal</span><span>₦{totalPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
              <span>Service charge (10%)</span><span>₦{serviceCharge.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, marginBottom: 16 }}>
              <span>Total</span><span style={{ color: '#095C46' }}>₦{total.toLocaleString()}</span>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={onCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
