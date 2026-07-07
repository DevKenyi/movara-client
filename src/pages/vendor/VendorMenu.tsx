import { useEffect, useState } from 'react'
import api from '../../api/axios'
import type { MenuItem } from '../../types'
import DashboardLayout from '../../components/DashboardLayout'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

const EMPTY = { name: '', description: '', price: '', imageUrl: '', isAvailable: true }

export default function VendorMenu() {
  const [items, setItems]       = useState<MenuItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [form, setForm]         = useState<typeof EMPTY>(EMPTY)
  const [editId, setEditId]     = useState<string | null>(null)
  const [saving, setSaving]     = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError]       = useState('')

  const load = () =>
    api.get<MenuItem[]>('/api/vendor/menu')
      .then(r => setItems(r.data))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const startEdit = (item: MenuItem) => {
    setEditId(item.id)
    setForm({
      name: item.name,
      description: item.description ?? '',
      price: String(item.price),
      imageUrl: item.imageUrl ?? '',
      isAvailable: item.isAvailable,
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => { setForm(EMPTY); setEditId(null); setShowForm(false); setError('') }

  const handleSave = async () => {
    if (!form.name || !form.price) { setError('Name and price are required'); return }
    setSaving(true); setError('')
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      imageUrl: form.imageUrl,
      isAvailable: form.isAvailable,
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Menu Items</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{items.length} items</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}
          onClick={() => { resetForm(); setShowForm(true) }}
        >
          <Plus size={14} /> Add Item
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="surface-card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
              {editId ? 'Edit Item' : 'New Menu Item'}
            </h3>
            <button onClick={resetForm} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
              <X size={14} />
            </button>
          </div>

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
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                onClick={() => setForm(p => ({ ...p, isAvailable: !p.isAvailable }))}
                style={{
                  width: 40, height: 22, borderRadius: 9999, cursor: 'pointer',
                  background: form.isAvailable ? '#095C46' : '#D1D5DB',
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: form.isAvailable ? 21 : 3,
                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s',
                }} />
              </div>
              <label style={{ fontSize: 13, color: '#374151', fontWeight: 500, cursor: 'pointer' }}
                onClick={() => setForm(p => ({ ...p, isAvailable: !p.isAvailable }))}>
                Available for ordering
              </label>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '8px 12px', marginTop: 10, color: '#DC2626', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : (editId ? 'Update Item' : 'Add Item')}
            </button>
            <button
              onClick={resetForm}
              style={{ background: '#F3F4F6', border: 'none', borderRadius: 9999, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Items list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Loading menu…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="surface-card" style={{ padding: 64, textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 10 }}>🍽️</p>
          <p style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>No menu items yet</p>
          <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 16 }}>Add your first item to get started</p>
          <button className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }} onClick={() => setShowForm(true)}>
            <Plus size={14} /> Add Item
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => (
            <div key={item.id} className="surface-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name}
                  style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                  background: '#E8F5F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>🍽️</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{item.name}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#095C46', marginTop: 2 }}>
                  ₦{Number(item.price).toLocaleString()}
                </p>
                {!item.isAvailable && (
                  <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>• Unavailable</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => startEdit(item)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #E5E7EB',
                    background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#095C46',
                  }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #FCA5A5',
                    background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626',
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
