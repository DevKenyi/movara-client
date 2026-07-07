import { useCart } from '../contexts/CartContext'

interface Props {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

export default function CartDrawer({ open, onClose, onCheckout }: Props) {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()
  const SERVICE_RATE = 0.10

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40
          }}
        />
      )}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--white)',
        borderRadius: '20px 20px 0 0',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
        maxHeight: '80vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)'
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#DDD' }} />
        </div>

        <div style={{ padding: '0 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Your Cart</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px' }}>
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px 0', fontSize: 14 }}>
              Your cart is empty
            </p>
          ) : (
            items.map(({ menuItem, quantity }) => (
              <div key={menuItem.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0', borderBottom: '1px solid var(--border)'
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{menuItem.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    ₦{Number(menuItem.price).toLocaleString()} × {quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                    style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--white)', cursor: 'pointer', fontWeight: 700 }}>−</button>
                  <span style={{ fontWeight: 600, fontSize: 14, minWidth: 16, textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                    style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,var(--green-start),var(--green-end))', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700 }}>+</button>
                </div>
                <p style={{ fontWeight: 700, fontSize: 14, minWidth: 72, textAlign: 'right' }}>
                  ₦{(Number(menuItem.price) * quantity).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding: '12px 16px 24px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
              <span>Subtotal</span><span>₦{totalPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              <span>Service charge (10%)</span>
              <span>₦{(totalPrice * SERVICE_RATE).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
              <span>Total</span>
              <span>₦{(totalPrice * (1 + SERVICE_RATE)).toLocaleString()}</span>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={onCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
