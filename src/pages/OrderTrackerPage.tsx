import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import OrderStepper from '../components/OrderStepper'
import api from '../api/axios'
import type { OrderStatus } from '../types'

export default function OrderTrackerPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<OrderStatus>('PENDING_PAYMENT')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sseRef = useRef<EventSource | null>(null)

  const fetchStatus = async () => {
    try {
      const { data } = await api.get<{ status: OrderStatus; updatedAt: string }>(
        `/api/public/orders/${orderId}/status`
      )
      setStatus(data.status)
    } catch {
      setError('Unable to load order status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!orderId) return
    fetchStatus()

    // SSE for real-time updates
    const sse = new EventSource(`/api/sse/orders/${orderId}`)
    sseRef.current = sse
    sse.addEventListener('order-update', (e) => {
      try {
        const data = JSON.parse(e.data)
        setStatus(data.status as OrderStatus)
      } catch {}
    })
    sse.onerror = () => {
      // SSE failed — fall back to polling every 4s
      sse.close()
      intervalRef.current = setInterval(fetchStatus, 4000)
    }

    return () => {
      sse.close()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [orderId])

  // Stop polling once delivered or failed
  useEffect(() => {
    if (['DELIVERED', 'CANCELLED', 'FAILED'].includes(status)) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      sseRef.current?.close()
    }
  }, [status])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading order…</p>
      </div>
    </div>
  )

  const isFailed   = status === 'CANCELLED' || status === 'FAILED'
  const isDelivered = status === 'DELIVERED'

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 20 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px',
          background: isFailed ? '#FEE2E2' : 'linear-gradient(135deg, var(--green-start), var(--green-end))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28
        }}>
          {isFailed ? '❌' : isDelivered ? '🎉' : '🍽️'}
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>
          {isFailed ? 'Order Issue' : isDelivered ? 'Enjoy Your Meal!' : 'Order Tracking'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Order ID: <code style={{ fontSize: 11 }}>{orderId?.substring(0, 8)}…</code>
        </p>
      </div>

      {error && <p style={{ color: '#DC2626', textAlign: 'center', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      {isFailed ? (
        <div className="card" style={{ padding: 20, textAlign: 'center' }}>
          <p style={{ color: '#DC2626', fontWeight: 600, marginBottom: 12 }}>
            {status === 'CANCELLED' ? 'Order was cancelled' : 'Payment failed'}
          </p>
          <button className="btn-primary" onClick={() => navigate(-2)}>Order Again</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11 }}>Live Status</h3>
          <OrderStepper status={status} />
        </div>
      )}

      {status === 'PENDING_PAYMENT' && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: '#FFFBEB', borderRadius: 8,
          border: '1px solid #F59E0B', fontSize: 13, color: '#92400E' }}>
          ⏳ Waiting for payment confirmation. Keep this tab open.
        </div>
      )}

      {isDelivered && (
        <button className="btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={() => navigate(-2)}>
          Order Again
        </button>
      )}
    </div>
  )
}
