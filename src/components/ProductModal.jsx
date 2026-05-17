import { useState, useEffect, useRef } from 'react'
import { X, Link, Loader2, Package, Star } from 'lucide-react'
import { useStore } from '../store/useStore'
import { FREQUENCIES } from '../utils/cost'
import { fetchOGData } from '../utils/ogFetch'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Wishlist' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'delivered', label: 'Delivered' },
]

const emptyForm = {
  name: '',
  price: '',
  imageUrl: '',
  productUrl: '',
  frequency: { type: 'monthly', interval: '', unit: 'days' },
  status: 'active',
  notes: '',
  sectionId: 'section_unsorted',
}

const inputCls = 'w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors'

export default function ProductModal() {
  const { addModalOpen, editingProduct, addToSectionId, closeModal, addProduct, updateProduct, sections, board } = useStore()
  const [form, setForm] = useState(emptyForm)
  const [urlInput, setUrlInput] = useState('')
  const [fetching, setFetching] = useState(false)
  const [imgError, setImgError] = useState(false)
  const nameRef = useRef()

  useEffect(() => {
    if (!addModalOpen) return
    if (editingProduct) {
      setForm({
        name: editingProduct.name || '',
        price: editingProduct.price || '',
        imageUrl: editingProduct.imageUrl || '',
        productUrl: editingProduct.productUrl || '',
        frequency: editingProduct.frequency || { type: 'monthly', interval: '', unit: 'days' },
        status: editingProduct.status || 'active',
        notes: editingProduct.notes || '',
        sectionId: editingProduct.sectionId || 'section_unsorted',
      })
      setUrlInput(editingProduct.productUrl || '')
    } else {
      setForm({ ...emptyForm, sectionId: addToSectionId || 'section_unsorted' })
      setUrlInput('')
    }
    setImgError(false)
    setTimeout(() => nameRef.current?.focus(), 50)
  }, [addModalOpen, editingProduct, addToSectionId])

  if (!addModalOpen) return null

  async function handleUrlFetch() {
    if (!urlInput.trim()) return
    setFetching(true)
    setForm(f => ({ ...f, productUrl: urlInput.trim() }))
    const data = await fetchOGData(urlInput.trim())
    setFetching(false)
    if (data) {
      setForm(f => ({
        ...f,
        name: data.name || f.name,
        imageUrl: data.imageUrl || f.imageUrl,
        price: data.price || f.price,
        productUrl: urlInput.trim(),
      }))
    }
  }

  function save(overrideStatus) {
    const product = { ...form, price: parseFloat(form.price) || 0, productUrl: urlInput.trim() || form.productUrl }
    if (overrideStatus) product.status = overrideStatus
    if (editingProduct?.id && !editingProduct.id.startsWith('product_dup')) {
      updateProduct(editingProduct.id, product)
    } else if (editingProduct) {
      addProduct({ ...product, id: undefined })
    } else {
      addProduct(product)
    }
    closeModal()
  }

  function handleSubmit(e) {
    e.preventDefault()
    save()
  }

  const freq = form.frequency

  const fieldStyle = {
    background: 'var(--c-input)',
    border: '1px solid var(--c-border-input)',
    color: 'var(--c-text)',
  }
  const focusAccent = e => e.currentTarget.style.borderColor = 'var(--c-accent)'
  const blurField = e => e.currentTarget.style.borderColor = 'var(--c-border-input)'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={closeModal}>
      <div
        className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-input)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4" style={{ borderBottom: '1px solid var(--c-border-input)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--c-text)' }}>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={closeModal} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--c-text-4)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.background = 'var(--c-border-input)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-4)'; e.currentTarget.style.background = 'transparent' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* URL fetch */}
          <div>
            <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--c-text-4)' }}>Product URL</label>
            <div className="flex gap-2">
              <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleUrlFetch())}
                placeholder="Paste link to auto-fill..."
                className={inputCls + ' flex-1'}
                style={fieldStyle} onFocus={focusAccent} onBlur={blurField}
              />
              <button type="button" onClick={handleUrlFetch} disabled={fetching || !urlInput.trim()}
                className="px-4 py-2.5 rounded-xl text-sm text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-40"
                style={{ background: 'var(--c-accent)' }}>
                {fetching ? <Loader2 size={16} className="animate-spin" /> : <Link size={16} />}
                {fetching ? 'Fetching…' : 'Fetch'}
              </button>
            </div>
          </div>

          {/* Image preview */}
          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: 'var(--c-input)', border: '1px solid var(--c-border-input)' }}>
              {form.imageUrl && !imgError ? (
                <img src={form.imageUrl} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
              ) : (
                <Package size={28} style={{ color: 'var(--c-text-7)' }} />
              )}
            </div>
            <div className="flex-1">
              <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--c-text-4)' }}>Image URL</label>
              <input type="url" value={form.imageUrl}
                onChange={e => { setForm(f => ({ ...f, imageUrl: e.target.value })); setImgError(false) }}
                placeholder="https://..."
                className={inputCls} style={fieldStyle} onFocus={focusAccent} onBlur={blurField}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--c-text-4)' }}>Product Name *</label>
            <input ref={nameRef} type="text" required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Neutrogena Sunscreen SPF 50"
              className={inputCls} style={fieldStyle} onFocus={focusAccent} onBlur={blurField}
            />
          </div>

          {/* Price + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--c-text-4)' }}>Price * ({board.currency})</label>
              <input type="number" required min="0" step="any" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0" className={inputCls} style={fieldStyle} onFocus={focusAccent} onBlur={blurField}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--c-text-4)' }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className={inputCls} style={fieldStyle} onFocus={focusAccent} onBlur={blurField}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--c-text-4)' }}>Frequency *</label>
            <select value={freq.type} onChange={e => setForm(f => ({ ...f, frequency: { ...f.frequency, type: e.target.value } }))}
              className={inputCls} style={fieldStyle} onFocus={focusAccent} onBlur={blurField}>
              {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            {freq.type === 'custom' && (
              <div className="flex gap-2 mt-2 items-center">
                <span className="text-sm" style={{ color: 'var(--c-text-4)' }}>Every</span>
                <input type="number" min="1" value={freq.interval}
                  onChange={e => setForm(f => ({ ...f, frequency: { ...f.frequency, interval: e.target.value } }))}
                  placeholder="14" className="w-20 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={fieldStyle} onFocus={focusAccent} onBlur={blurField}
                />
                <select value={freq.unit} onChange={e => setForm(f => ({ ...f, frequency: { ...f.frequency, unit: e.target.value } }))}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={fieldStyle} onFocus={focusAccent} onBlur={blurField}>
                  <option value="days">days</option>
                  <option value="weeks">weeks</option>
                  <option value="months">months</option>
                </select>
              </div>
            )}
          </div>

          {/* Section */}
          <div>
            <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--c-text-4)' }}>Section</label>
            <select value={form.sectionId} onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))}
              className={inputCls} style={fieldStyle} onFocus={focusAccent} onBlur={blurField}>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--c-text-4)' }}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value.slice(0, 300) }))}
              placeholder="Optional notes..." rows={2}
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors resize-none"
              style={fieldStyle} onFocus={focusAccent} onBlur={blurField}
            />
            <div className="text-right text-xs mt-1" style={{ color: 'var(--c-text-6)' }}>{form.notes.length}/300</div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={closeModal}
              className="py-2.5 px-4 rounded-xl border text-sm transition-colors"
              style={{ borderColor: 'var(--c-border-input)', color: 'var(--c-text-4)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.borderColor = 'var(--c-border-strong)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-4)'; e.currentTarget.style.borderColor = 'var(--c-border-input)' }}>
              Cancel
            </button>
            {!editingProduct && (
              <button type="button" onClick={() => save('paused')}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'rgba(124,92,252,0.15)', color: '#a78bfa', border: '1px solid rgba(124,92,252,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,92,252,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,92,252,0.15)'}>
                <Star size={14} /> Wishlist
              </button>
            )}
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm text-white font-medium transition-colors"
              style={{ background: 'var(--c-accent)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--c-accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--c-accent)'}>
              {editingProduct ? 'Save Changes' : 'Add Active'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
