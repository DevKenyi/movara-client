import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { Download, QrCode } from 'lucide-react'

export default function VendorQr() {
  const [loading, setLoading] = useState(false)

  const downloadQr = async () => {
    setLoading(true)
    try {
      const token = JSON.parse(localStorage.getItem('movara_auth') ?? '{}').token
      const res = await fetch('/api/vendor/qr', {
        headers: { Authorization: `Bearer ${token}` },
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
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Your QR Code</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
          Print and display this code at your restaurant
        </p>
      </div>

      <div style={{ maxWidth: 400 }}>
        <div className="surface-card" style={{ padding: 28, textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: '#E8F5F1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: '#095C46',
          }}>
            <QrCode size={24} />
          </div>

          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20, lineHeight: 1.6 }}>
            Customers scan this QR code to go directly to your menu page. Place it on tables, at the counter, or in your menu.
          </p>

          <div style={{
            background: '#F5F3EE', border: '2px dashed #E5E7EB', borderRadius: 14,
            padding: 20, marginBottom: 20, display: 'inline-block',
          }}>
            <img
              src="/api/vendor/qr"
              alt="Vendor QR Code"
              style={{ width: 240, height: 240, display: 'block' }}
              onError={(e) => {
                const img = e.target as HTMLImageElement
                img.style.display = 'none'
                img.parentElement!.innerHTML = `
                  <div style="width:240px;height:240px;display:flex;align-items:center;justify-content:center;color:#9CA3AF;font-size:13px;text-align:center;">
                    QR code unavailable.<br/>Try downloading below.
                  </div>`
              }}
            />
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            onClick={downloadQr}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Downloading…</>
              : <><Download size={16} /> Download PNG</>}
          </button>

          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 12 }}>
            Links to your live menu page
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
