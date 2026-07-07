import type { OrderStatus } from '../types'

const STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'PENDING_PAYMENT', label: 'Order Placed',       desc: 'Waiting for payment' },
  { status: 'PAID',            label: 'Payment Confirmed',  desc: 'Payment verified by Flutterwave' },
  { status: 'PREPARING',       label: 'Preparing',          desc: 'Kitchen is preparing your order' },
  { status: 'READY',           label: 'Ready for Pickup',   desc: 'Your order is ready!' },
  { status: 'DELIVERED',       label: 'Delivered',          desc: 'Enjoy your meal 🎉' },
]

const ORDER: Partial<Record<OrderStatus, number>> = {
  PENDING_PAYMENT: 0, PAID: 1, PREPARING: 2, READY: 3, DELIVERED: 4,
}

export default function OrderStepper({ status }: { status: OrderStatus }) {
  const currentIndex = ORDER[status] ?? 0

  return (
    <div style={{ padding: '4px 0' }}>
      {STEPS.map((step, i) => {
        const done   = i < currentIndex
        const active = i === currentIndex
        const last   = i === STEPS.length - 1

        return (
          <div key={step.status} style={{ display: 'flex', gap: 14 }}>
            {/* Connector column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 11,
                background: done || active ? '#095C46' : '#E5E7EB',
                color: done || active ? '#fff' : '#9CA3AF',
                border: active ? '2px solid #053A2C' : '2px solid transparent',
                transition: 'all 0.3s',
              }}>
                {done ? '✓' : i + 1}
              </div>
              {!last && (
                <div style={{
                  width: 2, flexGrow: 1, minHeight: 28,
                  background: done ? '#095C46' : '#E5E7EB',
                  margin: '3px 0',
                  transition: 'background 0.4s',
                }} />
              )}
            </div>

            {/* Text */}
            <div style={{ paddingBottom: last ? 0 : 20, paddingTop: 2 }}>
              <p style={{
                fontWeight: active ? 700 : 500,
                fontSize: 14,
                color: active ? '#095C46' : i < currentIndex ? '#111827' : '#9CA3AF',
              }}>
                {step.label}
              </p>
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{step.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
