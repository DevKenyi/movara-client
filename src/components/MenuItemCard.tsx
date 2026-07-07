import type { MenuItem } from '../types'
import { useCart } from '../contexts/CartContext'

interface Props {
  item: MenuItem
}

export default function MenuItemCard({ item }: Props) {
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const cartItem = items.find((i) => i.menuItem.id === item.id)
  const qty = cartItem?.quantity ?? 0

  return (
    <div className="card p-4 flex gap-3">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl"
          style={{ background: '#F0F4F0' }}>
          🍽️
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
        {item.description && (
          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-sm">₦{Number(item.price).toLocaleString()}</span>
          {qty === 0 ? (
            <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }} onClick={() => addItem(item)}>
              + Add
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, qty - 1)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--border)',
                  background: 'var(--white)', cursor: 'pointer', fontWeight: 700, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >−</button>
              <span className="font-semibold text-sm w-4 text-center">{qty}</span>
              <button
                onClick={() => addItem(item)}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--green-start), var(--green-end))',
                  border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700,
                  fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
