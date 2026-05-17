import { create } from 'zustand'
import { getMonthlyCost } from '../utils/cost'

const STORAGE_KEY = 'haul_v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

let saveTimer = null
function debouncedSave(state) {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const { board, sections, products } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ board, sections, products }))
  }, 300)
}

const defaultBoard = {
  id: 'board_1',
  name: 'My Haul',
  currency: 'PKR',
  monthlyBudget: '',
  theme: 'dark',
}

const defaultSection = {
  id: 'section_unsorted',
  boardId: 'board_1',
  name: 'Unsorted',
  order: 0,
  monthlyBudgetCap: '',
  isCollapsed: false,
}

function createInitialState() {
  const saved = loadState()
  if (saved) return saved
  return {
    board: defaultBoard,
    sections: [defaultSection],
    products: [],
  }
}

const initial = createInitialState()

export const useStore = create((set, get) => ({
  board: initial.board,
  sections: initial.sections,
  products: initial.products,

  // UI state (not persisted)
  searchQuery: '',
  filterStatus: '',
  filterSection: '',
  filterFrequency: '',
  showSettings: false,
  addModalOpen: false,
  editingProduct: null,
  addToSectionId: null,

  _save() {
    debouncedSave(get())
  },

  // Theme
  toggleTheme() {
    const next = get().board.theme === 'dark' ? 'light' : 'dark'
    set(s => ({ board: { ...s.board, theme: next } }))
    document.documentElement.classList.toggle('light', next === 'light')
    get()._save()
  },

  // Board
  updateBoard(patch) {
    set(s => ({ board: { ...s.board, ...patch } }))
    get()._save()
  },

  // Sections
  addSection(name) {
    const sections = get().sections
    const order = sections.length
    const section = {
      id: `section_${Date.now()}`,
      boardId: get().board.id,
      name,
      order,
      monthlyBudgetCap: '',
      isCollapsed: false,
    }
    set(s => ({ sections: [...s.sections, section] }))
    get()._save()
    return section.id
  },

  updateSection(id, patch) {
    set(s => ({
      sections: s.sections.map(sec => sec.id === id ? { ...sec, ...patch } : sec),
    }))
    get()._save()
  },

  deleteSection(id) {
    // Move products to unsorted
    set(s => ({
      sections: s.sections.filter(sec => sec.id !== id),
      products: s.products.map(p => p.sectionId === id ? { ...p, sectionId: 'section_unsorted' } : p),
    }))
    get()._save()
  },

  reorderSections(orderedIds) {
    set(s => ({
      sections: orderedIds.map((id, i) => {
        const sec = s.sections.find(s => s.id === id)
        return { ...sec, order: i }
      }),
    }))
    get()._save()
  },

  toggleSection(id) {
    set(s => ({
      sections: s.sections.map(sec =>
        sec.id === id ? { ...sec, isCollapsed: !sec.isCollapsed } : sec
      ),
    }))
    get()._save()
  },

  // Products
  addProduct(product) {
    const p = {
      id: `product_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...product,
    }
    set(s => ({ products: [...s.products, p] }))
    get()._save()
    return p.id
  },

  updateProduct(id, patch) {
    set(s => ({
      products: s.products.map(p =>
        p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
      ),
    }))
    get()._save()
  },

  deleteProduct(id) {
    set(s => ({ products: s.products.filter(p => p.id !== id) }))
    get()._save()
  },

  duplicateProduct(id) {
    const product = get().products.find(p => p.id === id)
    if (!product) return
    const dup = {
      ...product,
      id: `product_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: `${product.name} (copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set(s => ({ products: [...s.products, dup] }))
    get()._save()
  },

  cycleStatus(id) {
    const cycle = { active: 'paused', paused: 'ordered', ordered: 'delivered', delivered: 'active' }
    const product = get().products.find(p => p.id === id)
    if (!product) return
    get().updateProduct(id, { status: cycle[product.status] || 'active' })
  },

  reorderProducts(sectionId, orderedIds) {
    set(s => {
      const others = s.products.filter(p => p.sectionId !== sectionId)
      const reordered = orderedIds.map(id => s.products.find(p => p.id === id)).filter(Boolean)
      return { products: [...others, ...reordered] }
    })
    get()._save()
  },

  moveProduct(productId, toSectionId) {
    get().updateProduct(productId, { sectionId: toSectionId })
  },

  // Share
  shareSection(sectionId) {
    const section = get().sections.find(s => s.id === sectionId)
    if (!section) return
    const products = get().products.filter(p => p.sectionId === sectionId)
    const payload = {
      v: 1,
      section: { name: section.name },
      products: products.map(p => ({
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl || '',
        productUrl: p.productUrl || '',
        frequency: p.frequency,
        notes: p.notes || '',
      })),
    }
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
    const base = import.meta.env.VITE_APP_URL || window.location.origin
    const url = `${base}/#share=${encoded}`
    navigator.clipboard.writeText(url).catch(() => {})
    return url
  },

  importSharedProducts(selectedProducts, targetSectionId, newSectionName) {
    let sectionId = targetSectionId
    if (!sectionId) {
      sectionId = `section_${Date.now()}`
      const section = {
        id: sectionId,
        boardId: get().board.id,
        name: newSectionName || 'Imported',
        order: get().sections.length,
        monthlyBudgetCap: '',
        isCollapsed: false,
      }
      set(s => ({ sections: [...s.sections, section] }))
    }
    const now = new Date().toISOString()
    const newProducts = selectedProducts.map(p => ({
      ...p,
      id: `product_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sectionId,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }))
    set(s => ({ products: [...s.products, ...newProducts] }))
    get()._save()
  },

  // UI
  setSearchQuery(q) { set({ searchQuery: q }) },
  setFilterStatus(v) { set({ filterStatus: v }) },
  setFilterSection(v) { set({ filterSection: v }) },
  setFilterFrequency(v) { set({ filterFrequency: v }) },
  setShowSettings(v) { set({ showSettings: v }) },
  openAddModal(sectionId = null) { set({ addModalOpen: true, editingProduct: null, addToSectionId: sectionId }) },
  openEditModal(product) { set({ addModalOpen: true, editingProduct: product }) },
  closeModal() { set({ addModalOpen: false, editingProduct: null, addToSectionId: null }) },

  // Computed
  getSectionProducts(sectionId) {
    return get().products.filter(p => p.sectionId === sectionId)
  },

  getSectionMonthlyCost(sectionId) {
    return get().products
      .filter(p => p.sectionId === sectionId && (p.status === 'active' || p.status === 'ordered'))
      .reduce((sum, p) => sum + getMonthlyCost(p.price, p.frequency), 0)
  },

  getSectionWishlistCost(sectionId) {
    return get().products
      .filter(p => p.sectionId === sectionId && p.status === 'paused')
      .reduce((sum, p) => sum + getMonthlyCost(p.price, p.frequency), 0)
  },

  getTotalMonthlyCost() {
    return get().products
      .filter(p => p.status === 'active' || p.status === 'ordered')
      .reduce((sum, p) => sum + getMonthlyCost(p.price, p.frequency), 0)
  },

  getTotalWishlistCost() {
    return get().products
      .filter(p => p.status === 'paused')
      .reduce((sum, p) => sum + getMonthlyCost(p.price, p.frequency), 0)
  },

  getOneTimeTotal() {
    return get().products
      .filter(p => p.frequency?.type === 'oneTime' && p.status !== 'paused' && p.status !== 'delivered')
      .reduce((sum, p) => sum + (p.price || 0), 0)
  },

  toggleWishlist(id) {
    const p = get().products.find(p => p.id === id)
    if (!p) return
    const next = p.status === 'paused' ? 'active' : 'paused'
    get().updateProduct(id, { status: next })
  },

  getFilteredProducts() {
    const { products, searchQuery, filterStatus, filterSection, filterFrequency } = get()
    return products.filter(p => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filterStatus && p.status !== filterStatus) return false
      if (filterSection && p.sectionId !== filterSection) return false
      if (filterFrequency === 'recurring' && p.frequency?.type === 'oneTime') return false
      if (filterFrequency === 'oneTime' && p.frequency?.type !== 'oneTime') return false
      return true
    })
  },

  // Data management
  exportData() {
    const { board, sections, products } = get()
    const json = JSON.stringify({ board, sections, products }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'haul-export.json'
    a.click()
    URL.revokeObjectURL(url)
  },

  importData(json) {
    try {
      const data = JSON.parse(json)
      if (data.board && data.sections && data.products) {
        set({ board: data.board, sections: data.sections, products: data.products })
        get()._save()
        return true
      }
    } catch {}
    return false
  },

  clearAllData() {
    set({
      board: defaultBoard,
      sections: [defaultSection],
      products: [],
    })
    localStorage.removeItem(STORAGE_KEY)
  },
}))
