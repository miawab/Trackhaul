import { useEffect, useState } from 'react'
import './index.css'
import Board from './components/Board'
import SummaryBar from './components/SummaryBar'
import ProductModal from './components/ProductModal'
import SettingsPanel from './components/SettingsPanel'
import ShareImportModal from './components/ShareImportModal'
import { useStore } from './store/useStore'

function parseSharePayload() {
  try {
    const hash = window.location.hash
    if (!hash.startsWith('#share=')) return null
    const encoded = hash.slice('#share='.length)
    const json = decodeURIComponent(escape(atob(encoded)))
    const payload = JSON.parse(json)
    if (payload.v === 1 && payload.products) return payload
  } catch {}
  return null
}

export default function App() {
  const { showSettings, board } = useStore()
  const [sharePayload, setSharePayload] = useState(() => parseSharePayload())

  useEffect(() => {
    document.documentElement.classList.toggle('light', board.theme === 'light')
  }, [board.theme])

  return (
    <div className="min-h-screen" style={{ background: 'var(--c-bg)' }}>
      <Board />
      <SummaryBar />
      <ProductModal />
      {showSettings && <SettingsPanel />}
      {sharePayload && (
        <ShareImportModal
          payload={sharePayload}
          onClose={() => {
            setSharePayload(null)
            window.history.replaceState(null, '', window.location.pathname)
          }}
        />
      )}
    </div>
  )
}
