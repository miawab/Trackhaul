import { useEffect } from 'react'
import './index.css'
import Board from './components/Board'
import SummaryBar from './components/SummaryBar'
import ProductModal from './components/ProductModal'
import SettingsPanel from './components/SettingsPanel'
import { useStore } from './store/useStore'

export default function App() {
  const { showSettings, board } = useStore()

  useEffect(() => {
    document.documentElement.classList.toggle('light', board.theme === 'light')
  }, [board.theme])

  return (
    <div className="min-h-screen" style={{ background: 'var(--c-bg)' }}>
      <Board />
      <SummaryBar />
      <ProductModal />
      {showSettings && <SettingsPanel />}
    </div>
  )
}
