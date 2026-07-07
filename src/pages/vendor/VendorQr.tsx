import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'

export default function VendorQr() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const downloadQr = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/vendor/qr', {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('movara_auth') ?? '{}').token}` }
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'movara-qr.png'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to download QR code')
    } finally {
      setLoading(false) }
  }

  const qrSrc = `/api/vendor/qr`

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Your QR Code</h1>

      <div className="card" style={{ maxWidth: 400, padding: 32, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Print this QR code and place it at your restaurant. Customers scan it to go straight to your menu.
        </p>

        <div style={{ background: 'var(--bg)', border: '2px dashed var(--border)', borderRadius: 12, padding: 20, marginBottom: 20, display: 'inline-block' }}>
          <img
            src={qrSrc}
            alt="Vendor QR Code"
            style={{ width: 240, height: 240, display: 'block' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>

        <button className="btn-primary" style={{ width: '100%' }} onClick={downloadQr} disabled={loading}>
          {loading ? <span className="spinner" /> : '⬇ Download PNG'}
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12 }}>
          This QR links to your live menu page
        </p>
      </div>
    </DashboardLayout>
  )
}
