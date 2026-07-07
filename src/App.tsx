import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage          from './pages/LoginPage'
import CustomerMenuPage   from './pages/CustomerMenuPage'
import CheckoutPage       from './pages/CheckoutPage'
import OrderTrackerPage   from './pages/OrderTrackerPage'
import VendorDashboard    from './pages/vendor/VendorDashboard'
import VendorOrders       from './pages/vendor/VendorOrders'
import VendorMenu         from './pages/vendor/VendorMenu'
import VendorQr           from './pages/vendor/VendorQr'
import AdminVendors       from './pages/admin/AdminVendors'
import AdminOrders        from './pages/admin/AdminOrders'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Customer QR flow — cart context scoped here */}
          <Route path="/r/:vendorSlug" element={
            <CartProvider>
              <CustomerMenuPage />
            </CartProvider>
          } />
          <Route path="/r/:vendorSlug/checkout" element={
            <CartProvider>
              <CheckoutPage />
            </CartProvider>
          } />
          <Route path="/order/:orderId/status" element={<OrderTrackerPage />} />

          {/* Vendor dashboard */}
          <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="/vendor/dashboard" element={
            <ProtectedRoute allowedRoles={['VENDOR_STAFF', 'ADMIN']}>
              <VendorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/vendor/orders" element={
            <ProtectedRoute allowedRoles={['VENDOR_STAFF', 'ADMIN']}>
              <VendorOrders />
            </ProtectedRoute>
          } />
          <Route path="/vendor/menu" element={
            <ProtectedRoute allowedRoles={['VENDOR_STAFF', 'ADMIN']}>
              <VendorMenu />
            </ProtectedRoute>
          } />
          <Route path="/vendor/qr" element={
            <ProtectedRoute allowedRoles={['VENDOR_STAFF', 'ADMIN']}>
              <VendorQr />
            </ProtectedRoute>
          } />

          {/* Admin dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/vendors" replace />} />
          <Route path="/admin/vendors" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminVendors />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminOrders />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
