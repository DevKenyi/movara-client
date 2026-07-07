import { useEffect, useState } from 'react'
import api from '../../api/axios'
import type { Order, OrderStatus } from '../../types'
import DashboardLayout from '../../components/DashboardLayout'
import StatusPill from '../../components/StatusPill'
import { RefreshCw, ChevronRight } from 'lucide-react'

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
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    setRefreshing(true)
    try {
      const r = await api.get<Order[]>('/api/vendor/orders')
      setOrders(r.data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Orders</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{orders.length} total orders</p>
        </div>
        <button
          onClick={load}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#fff', border: '1.5px solid #E5E7EB',
            borderRadius: 9999, padding: '7px 14px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer', color: '#374151',
          }}
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : undefined }} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Loading orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="surface-card" style={{ padding: 64, textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 10 }}>📋</p>
          <p style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>No orders yet</p>
          <p style={{ color: '#9CA3AF', fontSize: 13 }}>Orders will appear here when customers place them</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const nextStatus = NEXT_STATUS[order.status]
            return (
              <div key={order.id} className="surface-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{order.customerName}</p>
                    <p style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{order.customerPhone}</p>
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

                {/* Items */}
                <div style={{ borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', padding: '10px 0', marginBottom: 12 }}>
                  {order.items.map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: '#6B7280' }}>{i.menuItemName} × {i.quantity}</span>
                      <span style={{ fontWeight: 500 }}>₦{Number(i.lineTotal).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {nextStatus && (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                    disabled={updating === order.id}
                    onClick={() => updateStatus(order.id, nextStatus)}
                  >
                    {updating === order.id
                      ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      : <><ChevronRight size={14} />{NEXT_LABEL[order.status]}</>}
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
