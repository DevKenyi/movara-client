import { useEffect, useState } from 'react'
import api from '../../api/axios'
import type { Vendor } from '../../types'
import DashboardLayout from '../../components/DashboardLayout'

export default function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', logoUrl: '' })
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = () =>
    api.get<Vendor[]>('/api/admin/vendors').then(r => setVendors(r.data)).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.name) { setError('Name is required'); return }
    setSaving(true); setError('')
    try {
      const { data } = await api.post<Vendor>('/api/admin/vendors', form)
      setVendors(prev => [...prev, data])
      setForm({ name: '', description: '', logoUrl: '' })
      setShowForm(false)
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Failed to create vendor')
    } finally { setSaving(false) }
  }

  const toggleVendor = async (id: string) => {
    setToggling(id)
    try {
      const { data } = await api.patch<Vendor>(`/api/admin/vendors/${id}/toggle`)
      setVendors(prev => prev.map(v => v.id === id ? data : v))
    } finally { setToggling(null) }
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Vendors</h1>
        <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => setShowForm(s => !s)}>
          + Add Vendor
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>New Vendor</h3>
          <div className="form-group">
            <label>Restaurant Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Chydec Kitchen" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description…" />
          </div>
          <div className="form-group">
            <label>Logo URL</label>
            <input value={form.logoUrl} onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))} placeholder="https://…" />
          </div>
          {error && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 8 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }} onClick={handleCreate} disabled={saving}>
              {saving ? <span className="spinner" /> : 'Create Vendor'}
            </button>
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div className="spinner" style={{ width: 28, height: 28, borderColor: 'var(--border)', borderTopColor: 'var(--green-end)', margin: 'auto' }} />
        </div>
      ) : vendors.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No vendors yet. Add the first one!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {vendors.map(vendor => (
            <div key={vendor.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              {vendor.logoUrl ? (
                <img src={vendor.logoUrl} alt={vendor.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 8, background: 'linear-gradient(135deg,var(--green-start),var(--green-end))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>
                  {vendor.name[0]}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{vendor.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>/{vendor.slug}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={vendor.isOpen ? 'badge-open' : 'badge-closed'}>
                  {vendor.isOpen ? 'Open' : 'Closed'}
                </span>
                <button
                  className="btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}
                  disabled={toggling === vendor.id}
                  onClick={() => toggleVendor(vendor.id)}
                >
                  {toggling === vendor.id ? <span className="spinner" style={{ borderColor: '#ccc', borderTopColor: '#333' }} /> : (vendor.isOpen ? 'Close' : 'Open')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
