import { useEffect, useState } from 'react'
import api from '../../api/axios'
import type { Order } from '../../types'
import DashboardLayout from '../../components/DashboardLayout'

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  PENDING_PAYMENT: { bg: '#FFFBEB', color: '#D97706' },
  PAID:            { bg: '#E6F7EE', color: '#3B8A5E' },
  PREPARING:       { bg: '#EFF6FF', color: '#2563EB' },
  READY:           { bg: '#F5F3FF', color: '#7C3AED' },
  DELIVERED:       { bg: '#F0FDF4', color: '#16A34A' },
  CANCELLED:       { bg: '#FEE2E2', color: '#DC2626' },
  FAILED:          { bg: '#FEE2E2', color: '#DC2626' },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    api.get<Order[]>('/api/admin/orders').then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  const statuses = ['ALL', 'PENDING_PAYMENT', 'PAID', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']
  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>All Orders</h1>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1.5px solid',
              borderColor: filter === s ? 'var(--green-end)' : 'var(--border)',
              background: filter === s ? 'linear-gradient(135deg,var(--green-start),var(--green-end))' : 'var(--white)',
              color: filter === s ? '#fff' : 'var(--text-secondary)'
            }}>
            {s.replace('_', ' ')}
            {s !== 'ALL' && <span style={{ marginLeft: 4, opacity: 0.75 }}>({orders.filter(o => o.status === s).length})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div className="spinner" style={{ width: 28, height: 28, borderColor: 'var(--border)', borderTopColor: 'var(--green-end)', margin: 'auto' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No orders found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(order => {
            const sc = STATUS_COLOR[order.status] ?? { bg: '#eee', color: '#666' }
            return (
              <div key={order.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{order.customerName}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{order.vendorName} · {order.customerPhone}</p>
                    <p style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span style={{ fontWeight: 700 }}>₦{Number(order.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
