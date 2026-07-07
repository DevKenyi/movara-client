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

    const sse = new EventSource(`/api/sse/orders/${orderId}`)
    sseRef.current = sse
    sse.addEventListener('order-update', (e) => {
      try { setStatus(JSON.parse(e.data).status as OrderStatus) } catch {}
    })
    sse.onerror = () => {
      sse.close()
      intervalRef.current = setInterval(fetchStatus, 4000)
    }

    return () => {
      sse.close()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [orderId])

  useEffect(() => {
    if (['DELIVERED', 'CANCELLED', 'FAILED'].includes(status)) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      sseRef.current?.close()
    }
  }, [status])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F5F3EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
        <p style={{ color: '#6B7280', fontSize: 14 }}>Loading order…</p>
      </div>
    </div>
  )

  const isFailed    = status === 'CANCELLED' || status === 'FAILED'
  const isDelivered = status === 'DELIVERED'

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F5F3EE', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: '#095C46', padding: '32px 20px 28px', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 14px',
          background: isFailed ? '#FEE2E2' : 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
          border: isFailed ? 'none' : '2px solid rgba(255,255,255,0.3)',
        }}>
          {isFailed ? '❌' : isDelivered ? '🎉' : '🍽️'}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
          {isFailed ? 'Order Issue' : isDelivered ? 'Enjoy Your Meal!' : 'Order Tracking'}
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>
          Order <code style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 4 }}>
            {orderId?.substring(0, 8).toUpperCase()}…
          </code>
        </p>
      </div>

      <div style={{ padding: '16px 16px 32px' }}>
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#DC2626', fontSize: 13 }}>
            {error}
          </div>
        )}

        {status === 'PENDING_PAYMENT' && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A',
            borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#92400E',
          }}>
            ⏳ Waiting for payment confirmation. Keep this tab open.
          </div>
        )}

        {isFailed ? (
          <div className="surface-card" style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ color: '#DC2626', fontWeight: 600, marginBottom: 16, fontSize: 15 }}>
              {status === 'CANCELLED' ? 'Your order was cancelled' : 'Payment failed'}
            </p>
            <button className="btn btn-primary" onClick={() => navigate(-2)}>
              Order Again
            </button>
          </div>
        ) : (
          <div className="surface-card" style={{ padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              Live Status
            </p>
            <OrderStepper status={status} />
          </div>
        )}

        {isDelivered && (
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }} onClick={() => navigate(-2)}>
            Order Again
          </button>
        )}
      </div>
    </div>
  )
}
