import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronRight, Plus, MoreVertical, Trash2, Edit2, GripVertical, Share2, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useState as useShareState } from 'react'
import { formatCurrency } from '../utils/cost'
import ProductCard from './ProductCard'

export default function Section({ section }) {
  const { getSectionProducts, getSectionMonthlyCost, getSectionWishlistCost, updateSection, deleteSection, toggleSection, openAddModal, getFilteredProducts, board, shareSection } = useStore()
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(section.name)
  const [budgetInput, setBudgetInput] = useState(section.monthlyBudgetCap || '')
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useShareState(false)

  function handleShare() {
    shareSection(section.id)
    setCopied(true)
    setMenuOpen(false)
    setTimeout(() => setCopied(false), 2000)
  }

  const { attributes, listeners, setNodeRef: setSortableRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const { setNodeRef: setDropRef } = useDroppable({ id: section.id })

  const allProducts = getSectionProducts(section.id)
  const filtered = getFilteredProducts()
  const products = allProducts.filter(p => filtered.some(f => f.id === p.id))
  const activeCost = getSectionMonthlyCost(section.id)
  const wishlistCost = getSectionWishlistCost(section.id)
  const monthlyCost = activeCost // alias for budget check
  const overBudget = section.monthlyBudgetCap && activeCost > parseFloat(section.monthlyBudgetCap)

  const wrapStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    background: 'var(--c-surface-alt)',
    border: `1px solid ${overBudget ? 'rgba(239,68,68,0.3)' : 'var(--c-border)'}`,
  }

  const headerStyle = {
    borderBottom: `1px solid ${overBudget ? 'rgba(239,68,68,0.4)' : 'var(--c-border)'}`,
    ...(overBudget ? { background: 'rgba(239,68,68,0.05)' } : {}),
  }

  function saveEdit() {
    if (nameInput.trim()) {
      updateSection(section.id, {
        name: nameInput.trim(),
        monthlyBudgetCap: parseFloat(budgetInput) || '',
      })
    }
    setEditing(false)
  }

  const menuItemHover = e => { e.currentTarget.style.background = 'var(--c-border-input)'; e.currentTarget.style.color = 'var(--c-text)' }
  const menuItemLeave = (e, c) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c }

  return (
    <div ref={setSortableRef} style={wrapStyle} className="rounded-2xl">
      {editing ? (
        <div className="px-4 py-3 rounded-t-2xl flex items-center gap-3" style={headerStyle}>
          <input
            autoFocus
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
            className="flex-1 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
            style={{ background: 'var(--c-input)', border: '1px solid var(--c-accent)', color: 'var(--c-text)' }}
            placeholder="Section name"
          />
          <input
            type="number"
            value={budgetInput}
            onChange={e => setBudgetInput(e.target.value)}
            className="w-28 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
            style={{ background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }}
            placeholder="Budget cap"
          />
          <button onClick={saveEdit} className="px-3 py-1.5 rounded-lg text-sm text-white" style={{ background: 'var(--c-accent)' }}>Save</button>
          <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg text-sm border" style={{ borderColor: 'var(--c-border-input)', color: 'var(--c-text-4)' }}>Cancel</button>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-3 rounded-t-2xl group" style={headerStyle}>
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing transition-opacity touch-none" style={{ color: 'var(--c-text-6)', opacity: 0.6 }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.6'} title="Drag to reorder">
            <GripVertical size={14} />
          </div>
          <button onClick={() => toggleSection(section.id)} className="transition-colors" style={{ color: 'var(--c-text-5)' }}>
            {section.isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
          <h3 className="flex-1 text-sm font-semibold" style={{ color: overBudget ? '#ef4444' : 'var(--c-text)' }}>
            {section.name}
          </h3>
          {copied && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
              <Check size={10} className="inline mr-1" />Link copied
            </span>
          )}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: overBudget ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.12)', color: overBudget ? '#ef4444' : '#22c55e', border: `1px solid ${overBudget ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.25)'}` }}>
              {formatCurrency(activeCost, board.currency)}/mo
            </span>
            {wishlistCost > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(124,92,252,0.12)', color: 'var(--c-accent)', border: '1px solid rgba(124,92,252,0.25)' }}
                title="Wishlist items (not committed)">
                +{formatCurrency(wishlistCost, board.currency)}/mo wishlist
              </span>
            )}
            {section.monthlyBudgetCap && (
              <span className="text-xs" style={{ color: 'var(--c-text-6)' }}>
                / {formatCurrency(parseFloat(section.monthlyBudgetCap), board.currency)}
              </span>
            )}
          </div>
          <button
            onClick={() => openAddModal(section.id)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all"
            style={{ color: 'var(--c-text-6)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.background = 'var(--c-border-input)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-6)'; e.currentTarget.style.background = 'transparent' }}
          >
            <Plus size={14} />
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(m => !m)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all"
              style={{ color: 'var(--c-text-6)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.background = 'var(--c-border-input)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-6)'; e.currentTarget.style.background = 'transparent' }}
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 rounded-xl shadow-xl py-1 min-w-[140px]" style={{ background: 'var(--c-popup)', border: '1px solid var(--c-border-input)' }}>
                  <button
                    onClick={() => { setNameInput(section.name); setBudgetInput(section.monthlyBudgetCap || ''); setEditing(true); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                    style={{ color: 'var(--c-text-3)' }}
                    onMouseEnter={e => menuItemHover(e)}
                    onMouseLeave={e => menuItemLeave(e, 'var(--c-text-3)')}
                  >
                    <Edit2 size={13} /> Rename
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                    style={{ color: 'var(--c-text-3)' }}
                    onMouseEnter={e => menuItemHover(e)}
                    onMouseLeave={e => menuItemLeave(e, 'var(--c-text-3)')}
                  >
                    <Share2 size={13} /> Share section
                  </button>
                  {section.id !== 'section_unsorted' && (
                    <button
                      onClick={() => { deleteSection(section.id); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 transition-colors"
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-border-input)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <Trash2 size={13} /> Delete section
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!section.isCollapsed && (
        <div ref={setDropRef} className="p-4 rounded-b-2xl">
          <SortableContext items={products.map(p => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
              <button
                onClick={() => openAddModal(section.id)}
                className="min-h-[180px] border border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
                style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-6)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text-4)'; e.currentTarget.style.borderColor = 'var(--c-border-strong)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-6)'; e.currentTarget.style.borderColor = 'var(--c-border)' }}
              >
                <Plus size={20} />
                <span className="text-xs">Add item</span>
              </button>
            </div>
          </SortableContext>
          {products.length === 0 && allProducts.length > 0 && (
            <p className="text-xs text-center py-2" style={{ color: 'var(--c-text-6)' }}>No items match current filters</p>
          )}
        </div>
      )}
    </div>
  )
}
