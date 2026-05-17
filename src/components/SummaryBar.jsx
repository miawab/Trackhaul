import { useStore } from '../store/useStore'
import { formatCurrency } from '../utils/cost'
import { TrendingUp, ShoppingCart, Package, AlertTriangle, Star } from 'lucide-react'

export default function SummaryBar() {
  const { board, products, getTotalMonthlyCost, getTotalWishlistCost, getOneTimeTotal } = useStore()

  const monthly = getTotalMonthlyCost()
  const wishlist = getTotalWishlistCost()
  const oneTime = getOneTimeTotal()
  const budget = parseFloat(board.monthlyBudget) || 0
  const activeCount = products.filter(p => p.status === 'active').length
  const pausedCount = products.filter(p => p.status === 'paused').length

  const budgetUsedPct = budget > 0 ? (monthly / budget) * 100 : 0
  const budgetRemaining = budget > 0 ? budget - monthly : null
  const budgetColor = budgetUsedPct > 100 ? '#ef4444' : budgetUsedPct > 80 ? '#eab308' : '#22c55e'
  const barColor = budgetUsedPct > 100 ? '#ef4444' : budgetUsedPct > 80 ? '#eab308' : '#22c55e'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-sm"
      style={{ borderTop: '1px solid var(--c-border)', background: 'color-mix(in srgb, var(--c-bg) 95%, transparent)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: 'var(--c-accent)' }} />
            <div>
              <div className="text-xs" style={{ color: 'var(--c-text-5)' }}>Monthly active</div>
              <div className="text-base font-bold" style={{ color: 'var(--c-text)' }}>{formatCurrency(monthly, board.currency)}</div>
            </div>
          </div>

          {wishlist > 0 && (
            <div className="flex items-center gap-2">
              <Star size={14} style={{ color: '#a78bfa', fill: '#a78bfa' }} />
              <div>
                <div className="text-xs" style={{ color: 'var(--c-text-5)' }}>Wishlist</div>
                <div className="text-sm font-semibold" style={{ color: '#a78bfa' }}>{formatCurrency(wishlist, board.currency)}</div>
              </div>
            </div>
          )}

          {budget > 0 && (
            <div className="flex-1 min-w-40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--c-text-5)' }}>Budget</span>
                <span className="text-xs font-medium" style={{ color: budgetColor }}>
                  {budgetRemaining !== null && (budgetRemaining >= 0
                    ? `${formatCurrency(budgetRemaining, board.currency)} left`
                    : `${formatCurrency(-budgetRemaining, board.currency)} over`
                  )}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-border)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(budgetUsedPct, 100)}%`, background: barColor }}
                />
              </div>
            </div>
          )}

          {oneTime > 0 && (
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} style={{ color: 'var(--c-text-4)' }} />
              <div>
                <div className="text-xs" style={{ color: 'var(--c-text-5)' }}>One-time</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--c-text-2)' }}>{formatCurrency(oneTime, board.currency)}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Package size={16} style={{ color: 'var(--c-text-4)' }} />
            <div className="text-xs" style={{ color: 'var(--c-text-5)' }}>
              <span className="font-medium" style={{ color: 'var(--c-text)' }}>{activeCount}</span> active
              {pausedCount > 0 && <>, <span style={{ color: 'var(--c-text-4)' }}>{pausedCount}</span> paused</>}
            </div>
          </div>

          {budget > 0 && monthly > budget && (
            <div className="flex items-center gap-1.5 text-red-500">
              <AlertTriangle size={14} />
              <span className="text-xs font-medium">Over budget</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
