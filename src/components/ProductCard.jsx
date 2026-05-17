import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MoreVertical, Edit2, Copy, Trash2, Package, GripVertical, ExternalLink, Star } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getMonthlyCost, getFrequencyLabel, formatCurrency } from '../utils/cost'

const STATUS_COLORS = {
  active:    'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
  paused:    'bg-purple-500/20 text-purple-400 border-purple-500/30',
  ordered:   'bg-blue-500/20 text-blue-500 border-blue-500/30',
  delivered: '',
}

const STATUS_LABELS = {
  active: 'active',
  paused: 'wishlist',
  ordered: 'ordered',
  delivered: 'delivered',
}

export default function ProductCard({ product }) {
  const { board, openEditModal, deleteProduct, duplicateProduct, cycleStatus, toggleWishlist } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }

  const isWishlist = product.status === 'paused'
  const isDimmed = product.status === 'delivered'
  const monthlyCost = getMonthlyCost(product.price, product.frequency)
  const freqLabel = getFrequencyLabel(product.frequency)
  const isOneTime = product.frequency?.type === 'oneTime'

  const deliveredStyle = product.status === 'delivered'
    ? { background: 'var(--c-border)', color: 'var(--c-text-4)', border: '1px solid var(--c-border-input)' }
    : {}

  function openLink(e) {
    e.stopPropagation()
    if (!product.productUrl) return
    window.open(product.productUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: 'var(--c-surface)', borderColor: isWishlist ? 'rgba(124,92,252,0.35)' : 'var(--c-border)' }}
      className={`group relative border rounded-xl overflow-hidden transition-all ${isDimmed ? 'opacity-50' : ''}`}
      onMouseEnter={e => e.currentTarget.style.borderColor = isWishlist ? 'rgba(124,92,252,0.6)' : 'var(--c-border-hover)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = isWishlist ? 'rgba(124,92,252,0.35)' : 'var(--c-border)'}
    >
      {/* Drag handle — always visible, slightly dimmed */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 transition-opacity cursor-grab active:cursor-grabbing p-0.5 rounded"
        style={{ color: 'var(--c-text-7)', opacity: 0.5 }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
        title="Drag to reorder"
      >
        <GripVertical size={14} />
      </div>

      {/* Wishlist star — always visible when wishlisted, hover-only otherwise */}
      <button
        onClick={e => { e.stopPropagation(); toggleWishlist(product.id) }}
        title={isWishlist ? 'Move to active' : 'Add to wishlist'}
        className={`absolute top-2 right-2 z-10 p-1 rounded-lg transition-all ${isWishlist ? '' : 'opacity-0 group-hover:opacity-100'}`}
        style={{ background: isWishlist ? 'rgba(124,92,252,0.15)' : 'transparent' }}
      >
        <Star size={13} style={{ color: isWishlist ? '#a78bfa' : 'var(--c-text-6)', fill: isWishlist ? '#a78bfa' : 'transparent' }} />
      </button>

      {/* Image */}
      <div
        className={`w-full h-32 flex items-center justify-center overflow-hidden relative ${product.productUrl ? 'cursor-pointer' : ''}`}
        style={{ background: 'var(--c-input)' }}
        onClick={product.productUrl ? openLink : undefined}
        title={product.productUrl ? 'Open product link' : undefined}
      >
        {product.imageUrl && !imgError ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <Package size={32} style={{ color: 'var(--c-text-8)' }} />
        )}
        {product.productUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.35)' }}>
            <ExternalLink size={18} className="text-white drop-shadow" />
          </div>
        )}
      </div>

      {/* Clickable content area → opens edit modal */}
      <div
        className="p-3 space-y-2 cursor-pointer"
        onClick={() => openEditModal(product)}
      >
        <p className="text-sm font-medium leading-tight line-clamp-2" style={{ color: 'var(--c-text)' }}>{product.name}</p>

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>
            {formatCurrency(product.price || 0, board.currency)}
          </span>
          {!isOneTime && (
            <span className="text-xs" style={{ color: isWishlist ? '#a78bfa' : 'var(--c-text-4)' }}>
              ≈ {formatCurrency(monthlyCost, board.currency)}/mo
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs" style={{ color: 'var(--c-text-5)' }}>{freqLabel}</span>
          <button
            onClick={e => { e.stopPropagation(); cycleStatus(product.id) }}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${product.status !== 'delivered' ? STATUS_COLORS[product.status] : ''}`}
            style={deliveredStyle}
          >
            {STATUS_LABELS[product.status] ?? product.status}
          </button>
        </div>

        {product.notes && (
          <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--c-text-5)' }}>{product.notes}</p>
        )}
      </div>

      {/* Hover quick actions bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'linear-gradient(to top, var(--c-surface) 60%, transparent)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditModal(product)}
            title="Edit"
            className="p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            style={{ color: 'var(--c-text-4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-border-input)'; e.currentTarget.style.color = 'var(--c-text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text-4)' }}
          >
            <Edit2 size={12} /> Edit
          </button>
          <button
            onClick={() => duplicateProduct(product.id)}
            title="Duplicate"
            className="p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            style={{ color: 'var(--c-text-4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-border-input)'; e.currentTarget.style.color = 'var(--c-text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text-4)' }}
          >
            <Copy size={12} /> Duplicate
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(m => !m)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--c-text-6)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-border-input)'; e.currentTarget.style.color = 'var(--c-text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text-6)' }}
          >
            <MoreVertical size={13} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 bottom-7 z-20 rounded-xl shadow-xl py-1 min-w-[150px]"
                style={{ background: 'var(--c-popup)', border: '1px solid var(--c-border-input)' }}>
                <button onClick={() => { openEditModal(product); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors" style={{ color: 'var(--c-text-3)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.background = 'var(--c-border-input)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-3)'; e.currentTarget.style.background = 'transparent' }}>
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => { duplicateProduct(product.id); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors" style={{ color: 'var(--c-text-3)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.background = 'var(--c-border-input)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-3)'; e.currentTarget.style.background = 'transparent' }}>
                  <Copy size={13} /> Duplicate
                </button>
                <button onClick={() => { toggleWishlist(product.id); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors" style={{ color: 'var(--c-text-3)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.background = 'var(--c-border-input)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-3)'; e.currentTarget.style.background = 'transparent' }}>
                  <Star size={13} /> {isWishlist ? 'Mark active' : 'Add to wishlist'}
                </button>
                {product.productUrl && (
                  <>
                    <div style={{ borderTop: '1px solid var(--c-border)', margin: '4px 0' }} />
                    <a href={product.productUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm transition-colors" style={{ color: 'var(--c-text-3)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.background = 'var(--c-border-input)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-3)'; e.currentTarget.style.background = 'transparent' }}>
                      <ExternalLink size={13} /> Open link
                    </a>
                  </>
                )}
                <div style={{ borderTop: '1px solid var(--c-border)', margin: '4px 0' }} />
                <button onClick={() => { deleteProduct(product.id); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--c-border-input)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
