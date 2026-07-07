import { useEffect, useState } from 'react'
import api from '../../api/axios'
import type { Order, OrderStatus } from '../../types'
import DashboardLayout from '../../components/DashboardLayout'
import StatusPill from '../../components/StatusPill'
import { ClipboardList, TrendingUp, Clock, CheckCircle } from 'lucide-react'

interface Stats {
  totalOrders: number
  totalRevenue: number
  pendingCount: number
  deliveredToday: number
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="surface-card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginTop: 4 }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{sub}</p>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E8F5F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#095C46' }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

const ACTIVE_STATUSES: OrderStatus[] = ['PAID', 'PREPARING', 'READY']

export default function VendorDashboard() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Order[]>('/api/vendor/orders')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toDateString()
  const stats: Stats = {
    totalOrders:    orders.length,
    totalRevenue:   orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'FAILED').reduce((s, o) => s + Number(o.total), 0),
    pendingCount:   orders.filter(o => ACTIVE_STATUSES.includes(o.status as OrderStatus)).length,
    deliveredToday: orders.filter(o => o.status === 'DELIVERED' && new Date(o.createdAt).toDateString() === today).length,
  }

  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status as OrderStatus))

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Loading dashboard…</p>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
            <StatCard icon={<ClipboardList size={18} />} label="Total Orders" value={stats.totalOrders} />
            <StatCard icon={<TrendingUp size={18} />} label="Total Revenue" value={`₦${stats.totalRevenue.toLocaleString()}`} sub="excl. cancelled" />
            <StatCard icon={<Clock size={18} />} label="Active Now" value={stats.pendingCount} sub="in queue" />
            <StatCard icon={<CheckCircle size={18} />} label="Delivered Today" value={stats.deliveredToday} />
          </div>

          {/* Active orders */}
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
              Active Orders
              {activeOrders.length > 0 && (
                <span style={{
                  marginLeft: 8, background: '#095C46', color: '#fff',
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                }}>
                  {activeOrders.length}
                </span>
              )}
            </h2>

            {activeOrders.length === 0 ? (
              <div className="surface-card" style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
                <p style={{ fontWeight: 600, color: '#374151' }}>All clear!</p>
                <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>No active orders right now</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeOrders.map(order => (
                  <div key={order.id} className="surface-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{order.customerName}</p>
                      <p style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{order.customerPhone}</p>
                      <p style={{ fontSize: 11, color: '#D1D5DB', marginTop: 2 }}>
                        {new Date(order.createdAt).toLocaleString('en-NG', { timeStyle: 'short' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <StatusPill status={order.status} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#095C46' }}>
                        ₦{Number(order.total).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
