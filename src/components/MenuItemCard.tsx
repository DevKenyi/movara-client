import type { MenuItem } from '../types'
import { useCart } from '../contexts/CartContext'
import { Plus, Minus } from 'lucide-react'

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const { items, addItem, updateQuantity } = useCart()
  const cartItem = items.find(i => i.menuItem.id === item.id)
  const qty = cartItem?.quantity ?? 0

  return (
    <div className="surface-card" style={{ padding: 14, display: 'flex', gap: 12 }}>
      {/* Image */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl} alt={item.name}
          style={{ width: 76, height: 76, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: 76, height: 76, borderRadius: 10, flexShrink: 0,
          background: '#E8F5F1', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 26,
        }}>
          🍽️
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{item.name}</p>
        {item.description && (
          <p style={{
            fontSize: 12, color: '#6B7280', marginTop: 3,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
          }}>
            {item.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#095C46' }}>
            ₦{Number(item.price).toLocaleString()}
          </span>

          {qty === 0 ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => addItem(item)}
              style={{ gap: 4, paddingLeft: 12, paddingRight: 12 }}
            >
              <Plus size={13} /> Add
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => updateQuantity(item.id, qty - 1)}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '1.5px solid #E5E7EB', background: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#095C46',
                }}
              >
                <Minus size={13} />
              </button>
              <span style={{ fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: 'center' }}>{qty}</span>
              <button
                onClick={() => addItem(item)}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#095C46', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Plus size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
