export interface Vendor {
  id: string
  name: string
  slug: string
  description: string
  logoUrl: string | null
  isOpen: boolean
  createdAt: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string | null
  isAvailable: boolean
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED'

export interface OrderItem {
  id: string
  menuItemId: string
  menuItemName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Order {
  id: string
  vendorId: string
  vendorName: string
  customerName: string
  customerPhone: string
  subtotal: number
  serviceCharge: number
  total: number
  paymentReference: string
  status: OrderStatus
  items: OrderItem[]
  createdAt: string
  paidAt: string | null
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
}

export type Role = 'ADMIN' | 'VENDOR_STAFF' | 'CUSTOMER'

export interface AuthUser {
  token: string
  email: string
  role: Role
  vendorId: string | null
}
