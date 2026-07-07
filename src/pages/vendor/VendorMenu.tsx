import { useEffect, useState } from 'react'
import api from '../../api/axios'
import type { MenuItem } from '../../types'
import DashboardLayout from '../../components/DashboardLayout'

const EMPTY = { name: '', description: '', price: '', imageUrl: '', isAvailable: true }

export default function VendorMenu() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<typeof EMPTY>(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const load = () =>
    api.get<MenuItem[]>('/api/vendor/menu').then(r => setItems(r.data)).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const startEdit = (item: MenuItem) => {
    setEditId(item.id)
    setForm({ name: item.name, description: item.description ?? '', price: String(item.price), imageUrl: item.imageUrl ?? '', isAvailable: item.isAvailable })
    setShowForm(true)
  }

  const resetForm = () => { setForm(EMPTY); setEditId(null); setShowForm(false); setError('') }

  const handleSave = async () => {
    if (!form.name || !form.price) { setError('Name and price are required'); return }
    setSaving(true); setError('')
    const payload = { name: form.name, description: form.description, price: parseFloat(form.price), imageUrl: form.imageUrl, isAvailable: form.isAvailable }
    try {
      if (editId) {
        const { data } = await api.put<MenuItem>(`/api/vendor/menu/${editId}`, payload)
        setItems(prev => prev.map(i => i.id === editId ? data : i))
      } else {
        const { data } = await api.post<MenuItem>('/api/vendor/menu', payload)
        setItems(prev => [...prev, data])
      }
      resetForm()
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    await api.delete(`/api/vendor/menu/${id}`)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Menu Items</h1>
        <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => { resetForm(); setShowForm(true) }}>
          + Add Item
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{editId ? 'Edit Item' : 'New Item'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Jollof Rice" />
            </div>
            <div className="form-group">
              <label>Price (₦) *</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="2500" />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://…" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description…" />
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="avail" checked={form.isAvailable} onChange={e => setForm(p => ({ ...p, isAvailable: e.target.checked }))} style={{ width: 'auto' }} />
              <label htmlFor="avail" style={{ margin: 0 }}>Available for ordering</label>
            </div>
          </div>
          {error && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 8 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }} onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" /> : (editId ? 'Update' : 'Add Item')}
            </button>
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* Items list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div className="spinner" style={{ width: 28, height: 28, borderColor: 'var(--border)', borderTopColor: 'var(--green-end)', margin: 'auto' }} />
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🍽️</p>
          <p style={{ color: 'var(--text-secondary)' }}>No menu items yet. Add your first item!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => (
            <div key={item.id} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: 8, background: '#F0F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🍽️</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  ₦{Number(item.price).toLocaleString()}
                  {!item.isAvailable && <span style={{ marginLeft: 8, color: '#DC2626' }}>• Unavailable</span>}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => startEdit(item)}>Edit</button>
                <button className="btn-danger" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
