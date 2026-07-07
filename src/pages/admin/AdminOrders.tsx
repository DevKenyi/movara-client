import { useEffect, useState } from 'react'
import api from '../../api/axios'
import type { Order } from '../../types'
import DashboardLayout from '../../components/DashboardLayout'
import StatusPill from '../../components/StatusPill'

const STATUSES = ['ALL', 'PENDING_PAYMENT', 'PAID', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']

export default function AdminOrders() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('ALL')

  useEffect(() => {
    api.get<Order[]>('/api/admin/orders')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>All Orders</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{orders.length} total orders</p>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {STATUSES.map(s => {
          const count = s !== 'ALL' ? orders.filter(o => o.status === s).length : null
          const active = filter === s
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '5px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', border: '1.5px solid',
                borderColor: active ? '#095C46' : '#E5E7EB',
                background: active ? '#095C46' : '#fff',
                color: active ? '#fff' : '#6B7280',
                transition: 'all 0.15s',
              }}
            >
              {s.replace('_', ' ')}
              {count !== null && count > 0 && (
                <span style={{ marginLeft: 5, opacity: active ? 0.8 : 0.6 }}>({count})</span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Loading orders…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-card" style={{ padding: 64, textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 10 }}>📋</p>
          <p style={{ fontWeight: 600, color: '#374151' }}>No orders found</p>
          <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>
            {filter !== 'ALL' ? `No ${filter.replace('_', ' ').toLowerCase()} orders` : 'No orders yet'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(order => (
            <div key={order.id} className="surface-card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{order.customerName}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>
                    {order.vendorName} · {order.customerPhone}
                  </p>
                  <p style={{ fontSize: 11, color: '#D1D5DB', marginTop: 2 }}>
                    {new Date(order.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <StatusPill status={order.status} />
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#095C46' }}>
                    ₦{Number(order.total).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
