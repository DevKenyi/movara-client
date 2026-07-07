import type { OrderStatus } from '../types'

const STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'PENDING_PAYMENT', label: 'Order Placed',    desc: 'We received your order' },
  { status: 'PAID',           label: 'Payment Confirmed', desc: 'Payment verified' },
  { status: 'PREPARING',      label: 'Preparing',        desc: 'Kitchen is on it' },
  { status: 'READY',          label: 'Ready',            desc: 'Your order is ready!' },
  { status: 'DELIVERED',      label: 'Delivered',        desc: 'Enjoy your meal!' },
]

const ORDER: Record<OrderStatus, number> = {
  PENDING_PAYMENT: 0, PAID: 1, PREPARING: 2, READY: 3, DELIVERED: 4,
  CANCELLED: -1, FAILED: -1,
}

interface Props { status: OrderStatus }

export default function OrderStepper({ status }: Props) {
  const currentIndex = ORDER[status] ?? 0

  return (
    <div style={{ padding: '8px 0' }}>
      {STEPS.map((step, i) => {
        const done    = i < currentIndex
        const active  = i === currentIndex
        const pending = i > currentIndex

        return (
          <div key={step.status} style={{ display: 'flex', gap: 16, paddingBottom: i < STEPS.length - 1 ? 0 : 0 }}>
            {/* Line + circle column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done || active
                  ? 'linear-gradient(135deg, var(--green-start), var(--green-end))'
                  : 'var(--border)',
                color: done || active ? '#fff' : '#999',
                fontWeight: 700, fontSize: 13,
                border: active ? '2px solid var(--green-end)' : 'none',
                transition: 'all 0.3s',
              }}>
                {done ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 2, flexGrow: 1, minHeight: 32,
                  background: done
                    ? 'linear-gradient(to bottom, var(--green-start), var(--green-end))'
                    : 'var(--border)',
                  transition: 'background 0.4s',
                  margin: '4px 0'
                }} />
              )}
            </div>

            {/* Text */}
            <div style={{ paddingBottom: i < STEPS.length - 1 ? 24 : 0, paddingTop: 2 }}>
              <p style={{
                fontWeight: active ? 700 : 500,
                fontSize: 14,
                color: pending ? 'var(--text-secondary)' : 'var(--text-primary)',
              }}>{step.label}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{step.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
