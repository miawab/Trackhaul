import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store/useStore'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Wishlist' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'delivered', label: 'Delivered' },
]

export default function SearchBar() {
  const { searchQuery, setSearchQuery, filterStatus, setFilterStatus, filterSection, setFilterSection, filterFrequency, setFilterFrequency, sections, products, getFilteredProducts } = useStore()
  const [showFilters, setShowFilters] = useState(false)

  const filtered = getFilteredProducts()
  const hasFilters = filterStatus || filterSection || filterFrequency
  const hiddenCount = products.length - filtered.length

  const inputStyle = { background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }
  const focusAccent = e => e.currentTarget.style.borderColor = 'var(--c-accent)'
  const blurBorder = e => e.currentTarget.style.borderColor = 'var(--c-border)'

  function clearAll() {
    setSearchQuery('')
    setFilterStatus('')
    setFilterSection('')
    setFilterFrequency('')
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--c-text-6)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none transition-colors"
            style={{ ...inputStyle, '::placeholder': { color: 'var(--c-placeholder)' } }}
            onFocus={focusAccent}
            onBlur={blurBorder}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--c-text-6)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-6)'}>
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className="px-3 py-2.5 rounded-xl border text-sm transition-colors flex items-center gap-2"
          style={hasFilters
            ? { borderColor: 'var(--c-accent)', color: 'var(--c-accent)', background: 'color-mix(in srgb, var(--c-accent) 10%, transparent)' }
            : { borderColor: 'var(--c-border)', color: 'var(--c-text-5)' }
          }
          onMouseEnter={e => { if (!hasFilters) { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.borderColor = 'var(--c-border-strong)' } }}
          onMouseLeave={e => { if (!hasFilters) { e.currentTarget.style.color = 'var(--c-text-5)'; e.currentTarget.style.borderColor = 'var(--c-border)' } }}
        >
          <SlidersHorizontal size={14} />
          Filters {hasFilters && `(${[filterStatus, filterSection, filterFrequency].filter(Boolean).length})`}
        </button>
      </div>

      {showFilters && (
        <div className="flex gap-2 flex-wrap">
          {[
            { value: filterStatus, onChange: setFilterStatus, placeholder: 'All statuses', options: STATUS_OPTIONS },
            { value: filterSection, onChange: setFilterSection, placeholder: 'All sections', options: sections.map(s => ({ value: s.id, label: s.name })) },
            { value: filterFrequency, onChange: setFilterFrequency, placeholder: 'All types', options: [{ value: 'recurring', label: 'Recurring' }, { value: 'oneTime', label: 'One-time' }] },
          ].map((sel, i) => (
            <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)}
              className="rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors"
              style={{ ...inputStyle, border: '1px solid var(--c-border)' }}
              onFocus={focusAccent} onBlur={blurBorder}
            >
              <option value="">{sel.placeholder}</option>
              {sel.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          {(hasFilters || searchQuery) && (
            <button onClick={clearAll} className="px-3 py-2 text-xs text-red-500 hover:text-red-400 transition-colors">
              Clear all
            </button>
          )}
        </div>
      )}

      {hiddenCount > 0 && (
        <p className="text-xs rounded-lg px-3 py-2" style={{ color: 'var(--c-text-5)', background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          {hiddenCount} item{hiddenCount > 1 ? 's' : ''} hidden by active filters
        </p>
      )}
    </div>
  )
}
