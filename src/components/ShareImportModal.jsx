import { useState } from 'react'
import { X, Package, Plus, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getMonthlyCost, getFrequencyLabel, formatCurrency } from '../utils/cost'

export default function ShareImportModal({ payload, onClose }) {
  const { sections, board, importSharedProducts } = useStore()
  const [selected, setSelected] = useState(() => new Set(payload.products.map((_, i) => i)))
  const [targetMode, setTargetMode] = useState('new') // 'new' | sectionId
  const [newSectionName, setNewSectionName] = useState(payload.section.name)
  const [imgErrors, setImgErrors] = useState({})
  const [done, setDone] = useState(false)

  function toggle(i) {
    setSelected(s => {
      const next = new Set(s)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === payload.products.length) setSelected(new Set())
    else setSelected(new Set(payload.products.map((_, i) => i)))
  }

  function handleImport() {
    const chosen = payload.products.filter((_, i) => selected.has(i))
    if (!chosen.length) return
    const isNew = targetMode === 'new'
    importSharedProducts(chosen, isNew ? null : targetMode, isNew ? newSectionName : null)
    setDone(true)
    setTimeout(() => {
      window.history.replaceState(null, '', window.location.pathname)
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl"
        style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-input)' }}>

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4" style={{ borderBottom: '1px solid var(--c-border-input)' }}>
          <div>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--c-accent)' }}>Shared section</p>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--c-text)' }}>{payload.section.name}</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--c-text-5)' }}>{payload.products.length} item{payload.products.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--c-text-4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-border-input)'; e.currentTarget.style.color = 'var(--c-text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text-4)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Item list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs" style={{ color: 'var(--c-text-5)' }}>{selected.size} of {payload.products.length} selected</span>
            <button onClick={toggleAll} className="text-xs transition-colors" style={{ color: 'var(--c-accent)' }}>
              {selected.size === payload.products.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          {payload.products.map((p, i) => {
            const isSelected = selected.has(i)
            const mc = getMonthlyCost(p.price, p.frequency)
            const isOneTime = p.frequency?.type === 'oneTime'
            return (
              <div key={i} onClick={() => toggle(i)}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{
                  background: isSelected ? 'color-mix(in srgb, var(--c-accent) 8%, var(--c-input))' : 'var(--c-input)',
                  border: `1px solid ${isSelected ? 'rgba(124,92,252,0.35)' : 'var(--c-border)'}`,
                }}>
                {/* Checkbox */}
                <div className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all"
                  style={{ background: isSelected ? 'var(--c-accent)' : 'var(--c-border-input)', border: `1px solid ${isSelected ? 'var(--c-accent)' : 'var(--c-border-strong)'}` }}>
                  {isSelected && <Check size={12} className="text-white" />}
                </div>

                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'var(--c-border-input)' }}>
                  {p.imageUrl && !imgErrors[i] ? (
                    <img src={p.imageUrl} alt="" className="w-full h-full object-cover"
                      onError={() => setImgErrors(e => ({ ...e, [i]: true }))} />
                  ) : (
                    <Package size={16} style={{ color: 'var(--c-text-7)' }} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{p.name}</p>
                  <p className="text-xs" style={{ color: 'var(--c-text-5)' }}>
                    {formatCurrency(p.price, board.currency)}
                    {!isOneTime && mc > 0 && <span style={{ color: 'var(--c-text-6)' }}> · ≈{formatCurrency(mc, board.currency)}/mo</span>}
                    {getFrequencyLabel(p.frequency) && <span> · {getFrequencyLabel(p.frequency)}</span>}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Target section picker */}
        <div className="p-4 pt-0 space-y-3">
          <div style={{ borderTop: '1px solid var(--c-border-input)', paddingTop: '16px' }}>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--c-text-4)' }}>Add to section</p>
            <div className="flex flex-col gap-2">
              {/* New section option */}
              <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{ background: targetMode === 'new' ? 'color-mix(in srgb, var(--c-accent) 8%, var(--c-input))' : 'var(--c-input)', border: `1px solid ${targetMode === 'new' ? 'rgba(124,92,252,0.35)' : 'var(--c-border)'}` }}>
                <input type="radio" className="hidden" checked={targetMode === 'new'} onChange={() => setTargetMode('new')} />
                <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ border: `2px solid ${targetMode === 'new' ? 'var(--c-accent)' : 'var(--c-border-strong)'}` }}>
                  {targetMode === 'new' && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--c-accent)' }} />}
                </div>
                <Plus size={14} style={{ color: 'var(--c-text-5)' }} />
                <input
                  type="text"
                  value={newSectionName}
                  onChange={e => { setNewSectionName(e.target.value); setTargetMode('new') }}
                  onClick={e => { e.stopPropagation(); setTargetMode('new') }}
                  placeholder="New section name"
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  style={{ color: 'var(--c-text)' }}
                />
              </label>

              {/* Existing sections */}
              {sections.map(sec => (
                <label key={sec.id} onClick={() => setTargetMode(sec.id)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{ background: targetMode === sec.id ? 'color-mix(in srgb, var(--c-accent) 8%, var(--c-input))' : 'var(--c-input)', border: `1px solid ${targetMode === sec.id ? 'rgba(124,92,252,0.35)' : 'var(--c-border)'}` }}>
                  <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ border: `2px solid ${targetMode === sec.id ? 'var(--c-accent)' : 'var(--c-border-strong)'}` }}>
                    {targetMode === sec.id && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--c-accent)' }} />}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--c-text)' }}>{sec.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Import button */}
          {done ? (
            <div className="py-2.5 rounded-xl text-sm text-white font-medium text-center bg-emerald-500">
              ✓ Added to your board
            </div>
          ) : (
            <button onClick={handleImport} disabled={selected.size === 0}
              className="w-full py-2.5 rounded-xl text-sm text-white font-medium transition-colors disabled:opacity-40"
              style={{ background: 'var(--c-accent)' }}
              onMouseEnter={e => { if (selected.size > 0) e.currentTarget.style.background = 'var(--c-accent-hover)' }}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--c-accent)'}>
              Import {selected.size} item{selected.size !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
