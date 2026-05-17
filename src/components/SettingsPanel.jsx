import { useRef, useState } from 'react'
import { X, Download, Upload, Trash2, AlertTriangle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CURRENCIES } from '../utils/cost'

export default function SettingsPanel() {
  const { board, updateBoard, setShowSettings, exportData, importData, clearAllData } = useStore()
  const [confirmClear, setConfirmClear] = useState(false)
  const fileRef = useRef()

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => {
      const ok = importData(evt.target.result)
      if (!ok) alert('Invalid file format.')
    }
    reader.readAsText(file)
  }

  const fieldStyle = { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }
  const focusAccent = e => e.currentTarget.style.borderColor = 'var(--c-accent)'
  const blurField = e => e.currentTarget.style.borderColor = 'var(--c-border-input)'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={() => setShowSettings(false)}>
      <div
        className="w-full max-w-sm h-full overflow-y-auto shadow-2xl"
        style={{ background: 'var(--c-surface)', borderLeft: '1px solid var(--c-border-input)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--c-border-input)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--c-text)' }}>Settings</h2>
          <button onClick={() => setShowSettings(false)} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--c-text-4)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.background = 'var(--c-border-input)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-4)'; e.currentTarget.style.background = 'transparent' }}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--c-text-4)' }}>Board Name</label>
            <input type="text" value={board.name} onChange={e => updateBoard({ name: e.target.value })}
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
              style={fieldStyle} onFocus={focusAccent} onBlur={blurField}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--c-text-4)' }}>Currency</label>
            <select value={board.currency} onChange={e => updateBoard({ currency: e.target.value })}
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
              style={fieldStyle} onFocus={focusAccent} onBlur={blurField}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--c-text-4)' }}>Monthly Budget (optional)</label>
            <input type="number" min="0" value={board.monthlyBudget} onChange={e => updateBoard({ monthlyBudget: e.target.value })}
              placeholder="Leave empty to disable"
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
              style={fieldStyle} onFocus={focusAccent} onBlur={blurField}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--c-border-input)' }} />

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--c-text-4)' }}>Data</p>

            {[
              { icon: Download, label: 'Export data as JSON', onClick: exportData },
              { icon: Upload, label: 'Import from JSON', onClick: () => fileRef.current?.click() },
            ].map(({ icon: Icon, label, onClick }) => (
              <button key={label} onClick={onClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors"
                style={{ background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text-2)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.borderColor = 'var(--c-border-strong)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--c-text-2)'; e.currentTarget.style.borderColor = 'var(--c-border-input)' }}>
                <Icon size={16} /> {label}
              </button>
            ))}
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

            {!confirmClear ? (
              <button onClick={() => setConfirmClear(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 transition-colors"
                style={{ background: 'var(--c-input)', border: '1px solid rgba(239,68,68,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)'; e.currentTarget.style.color = '#f87171' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#ef4444' }}>
                <Trash2 size={16} /> Clear all data
              </button>
            ) : (
              <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-medium">This will delete everything</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { clearAllData(); setShowSettings(false) }}
                    className="flex-1 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm text-white font-medium transition-colors">
                    Yes, clear all
                  </button>
                  <button onClick={() => setConfirmClear(false)}
                    className="flex-1 py-2 rounded-lg text-sm transition-colors"
                    style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-4)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-4)'}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
