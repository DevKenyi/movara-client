import { useEffect, useState } from 'react'
import api from '../../api/axios'
import type { Vendor } from '../../types'
import DashboardLayout from '../../components/DashboardLayout'
import { Plus, X, ToggleLeft, ToggleRight } from 'lucide-react'

export default function AdminVendors() {
  const [vendors, setVendors]   = useState<Vendor[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ name: '', description: '', logoUrl: '' })
  const [saving, setSaving]     = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [error, setError]       = useState('')

  const load = () =>
    api.get<Vendor[]>('/api/admin/vendors')
      .then(r => setVendors(r.data))
      .finally(() => setLoading(false))

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Restaurants</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{vendors.length} registered</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}
          onClick={() => setShowForm(s => !s)}
        >
          <Plus size={14} /> Add Vendor
        </button>
      </div>

      {showForm && (
        <div className="surface-card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>New Restaurant</h3>
            <button
              onClick={() => { setShowForm(false); setError('') }}
              style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
            >
              <X size={14} />
            </button>
          </div>
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
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '8px 12px', marginBottom: 10, color: '#DC2626', fontSize: 13 }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'Create Vendor'}
            </button>
            <button
              onClick={() => { setShowForm(false); setError('') }}
              style={{ background: '#F3F4F6', border: 'none', borderRadius: 9999, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Loading vendors…</p>
        </div>
      ) : vendors.length === 0 ? (
        <div className="surface-card" style={{ padding: 64, textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 10 }}>🏪</p>
          <p style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>No vendors yet</p>
          <p style={{ color: '#9CA3AF', fontSize: 13 }}>Add the first restaurant to get started</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {vendors.map(vendor => (
            <div key={vendor.id} className="surface-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              {vendor.logoUrl ? (
                <img src={vendor.logoUrl} alt={vendor.name}
                  style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                  background: '#095C46',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 20,
                }}>
                  {vendor.name[0].toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{vendor.name}</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>/{vendor.slug}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: vendor.isOpen ? 'rgba(9,92,70,0.08)' : '#FEE2E2',
                  color: vendor.isOpen ? '#095C46' : '#DC2626',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: vendor.isOpen ? '#095C46' : '#DC2626', display: 'inline-block' }} />
                  {vendor.isOpen ? 'Open' : 'Closed'}
                </span>
                <button
                  onClick={() => toggleVendor(vendor.id)}
                  disabled={toggling === vendor.id}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: vendor.isOpen ? '#095C46' : '#9CA3AF', display: 'flex', alignItems: 'center' }}
                >
                  {toggling === vendor.id
                    ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    : vendor.isOpen ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
