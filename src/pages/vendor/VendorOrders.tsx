import { useEffect, useState } from 'react'
import api from '../../api/axios'
import type { Order, OrderStatus } from '../../types'
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

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PAID: 'PREPARING', PREPARING: 'READY', READY: 'DELIVERED',
}
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  PAID: 'Start Preparing', PREPARING: 'Mark Ready', READY: 'Mark Delivered',
}

export default function VendorOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = () => {
    api.get<Order[]>('/api/vendor/orders')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId)
    try {
      const { data } = await api.patch<Order>(`/api/vendor/orders/${orderId}/status`, { status })
      setOrders(prev => prev.map(o => o.id === orderId ? data : o))
    } catch (e: any) {
      alert(e.response?.data?.error ?? 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Orders</h1>
        <button className="btn-secondary" onClick={load} style={{ fontSize: 13 }}>↻ Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div className="spinner" style={{ width: 28, height: 28, borderColor: 'var(--border)', borderTopColor: 'var(--green-end)', margin: 'auto' }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>📋</p>
          <p style={{ color: 'var(--text-secondary)' }}>No orders yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const sc = STATUS_COLOR[order.status] ?? { bg: '#F5F5F5', color: '#666' }
            const nextStatus = NEXT_STATUS[order.status]
            return (
              <div key={order.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{order.customerName}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{order.customerPhone}</p>
                    <p style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>₦{Number(order.total).toLocaleString()}</span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ margin: '10px 0 10px', padding: '10px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                  {order.items.map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{i.menuItemName} × {i.quantity}</span>
                      <span style={{ fontWeight: 500 }}>₦{Number(i.lineTotal).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {nextStatus && (
                  <button
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: 13 }}
                    disabled={updating === order.id}
                    onClick={() => updateStatus(order.id, nextStatus)}
                  >
                    {updating === order.id ? <span className="spinner" /> : NEXT_LABEL[order.status]}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
