import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Plus, Settings, Sun, Moon } from 'lucide-react'
import { useStore } from '../store/useStore'
import Section from './Section'
import SearchBar from './SearchBar'

export default function Board() {
  const { board, sections, products, addSection, reorderSections, reorderProducts, moveProduct, openAddModal, setShowSettings, toggleTheme } = useStore()
  const [newSectionName, setNewSectionName] = useState('')
  const [addingSection, setAddingSection] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const sortedSections = [...sections].sort((a, b) => a.order - b.order)
  const isLight = board.theme === 'light'

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return

    const isSectionDrag = sections.some(s => s.id === active.id)
    if (isSectionDrag) {
      const ids = sortedSections.map(s => s.id)
      const oldIdx = ids.indexOf(active.id)
      const newIdx = ids.indexOf(over.id)
      if (oldIdx !== -1 && newIdx !== -1) reorderSections(arrayMove(ids, oldIdx, newIdx))
      return
    }

    const activeProduct = products.find(p => p.id === active.id)
    if (!activeProduct) return

    if (sections.some(s => s.id === over.id)) {
      moveProduct(active.id, over.id)
      return
    }

    const overProduct = products.find(p => p.id === over.id)
    if (!overProduct) return

    if (activeProduct.sectionId === overProduct.sectionId) {
      const sectionProducts = products.filter(p => p.sectionId === activeProduct.sectionId)
      const ids = sectionProducts.map(p => p.id)
      const oldIdx = ids.indexOf(active.id)
      const newIdx = ids.indexOf(over.id)
      if (oldIdx !== -1 && newIdx !== -1) reorderProducts(activeProduct.sectionId, arrayMove(ids, oldIdx, newIdx))
    } else {
      moveProduct(active.id, overProduct.sectionId)
    }
  }

  function submitNewSection() {
    if (newSectionName.trim()) {
      addSection(newSectionName.trim())
      setNewSectionName('')
      setAddingSection(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--c-text)' }}>{board.name}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--c-text-5)' }}>{products.length} item{products.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white font-medium transition-colors"
            style={{ background: 'var(--c-accent)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--c-accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--c-accent)'}
          >
            <Plus size={16} />
            Add item
          </button>
          <button
            onClick={toggleTheme}
            title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            className="p-2.5 rounded-xl border transition-colors"
            style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-5)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.borderColor = 'var(--c-border-strong)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-5)'; e.currentTarget.style.borderColor = 'var(--c-border)' }}
          >
            {isLight ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-xl border transition-colors"
            style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-5)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.borderColor = 'var(--c-border-strong)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-5)'; e.currentTarget.style.borderColor = 'var(--c-border)' }}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* Sections */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortedSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {sortedSections.map(section => (
              <Section key={section.id} section={section} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add section */}
      <div className="mt-4">
        {addingSection ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={newSectionName}
              onChange={e => setNewSectionName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitNewSection(); if (e.key === 'Escape') setAddingSection(false) }}
              placeholder="Section name..."
              className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-accent)', color: 'var(--c-text)' }}
            />
            <button onClick={submitNewSection} className="px-4 py-2.5 rounded-xl text-sm text-white font-medium" style={{ background: 'var(--c-accent)' }}>Add</button>
            <button onClick={() => setAddingSection(false)} className="px-4 py-2.5 rounded-xl text-sm border transition-colors" style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-4)' }}>Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setAddingSection(true)}
            className="flex items-center gap-2 px-4 py-3 border border-dashed rounded-xl text-sm w-full justify-center transition-colors"
            style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-6)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text-4)'; e.currentTarget.style.borderColor = 'var(--c-border-strong)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-6)'; e.currentTarget.style.borderColor = 'var(--c-border)' }}
          >
            <Plus size={16} />
            Add section
          </button>
        )}
      </div>
    </div>
  )
}
