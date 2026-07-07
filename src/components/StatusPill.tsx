import type { OrderStatus } from '../types'

const CONFIG: Record<string, { label: string; cls: string }> = {
  PENDING_PAYMENT: { label: 'Pending Payment', cls: 'status-pending'   },
  PAID:            { label: 'Paid',            cls: 'status-paid'      },
  PREPARING:       { label: 'Preparing',       cls: 'status-preparing' },
  READY:           { label: 'Ready',           cls: 'status-ready'     },
  DELIVERED:       { label: 'Delivered',       cls: 'status-delivered' },
  CANCELLED:       { label: 'Cancelled',       cls: 'status-cancelled' },
  FAILED:          { label: 'Failed',          cls: 'status-failed'    },
}

export default function StatusPill({ status }: { status: OrderStatus | string }) {
  const cfg = CONFIG[status] ?? { label: status, cls: '' }
  return (
    <span className={`status-pill ${cfg.cls}`}>
      <span className="status-dot" />
      {cfg.label}
    </span>
  )
}
