'use client'

import { useState } from 'react'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import type { Holding } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  holdings: Holding[]
  onChange: (holdings: Holding[]) => void
}

export function PortfolioBuilder({ holdings, onChange }: Props) {
  const [ticker, setTicker] = useState('')
  const [weight, setWeight] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)

  const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0)

  function addHolding() {
    const tickerVal = ticker.trim().toUpperCase()
    const weightVal = parseFloat(weight)

    if (!tickerVal) {
      setInputError('Enter a ticker symbol')
      return
    }
    if (isNaN(weightVal) || weightVal <= 0 || weightVal > 100) {
      setInputError('Weight must be between 1 and 100')
      return
    }
    if (holdings.some((h) => h.ticker === tickerVal)) {
      setInputError(`${tickerVal} is already in the portfolio`)
      return
    }

    setInputError(null)
    onChange([...holdings, { ticker: tickerVal, weight: weightVal }])
    setTicker('')
    setWeight('')
  }

  function removeHolding(index: number) {
    onChange(holdings.filter((_, i) => i !== index))
  }

  function updateWeight(index: number, newWeight: number) {
    onChange(holdings.map((h, i) => (i === index ? { ...h, weight: newWeight } : h)))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') addHolding()
  }

  return (
    <div className="bg-surface-card rounded-xl border border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
          Portfolio Holdings
        </h2>
        <div
          className={cn(
            'text-xs font-mono px-2 py-1 rounded-md',
            totalWeight === 100
              ? 'bg-green-500/10 text-green-400'
              : totalWeight > 100
              ? 'bg-red-500/10 text-red-400'
              : 'bg-amber-500/10 text-amber-400',
          )}
        >
          {totalWeight}% / 100%
        </div>
      </div>

      {/* Holdings list */}
      {holdings.length > 0 && (
        <div className="space-y-2 mb-4">
          {holdings.map((holding, index) => (
            <HoldingRow
              key={holding.ticker}
              holding={holding}
              onWeightChange={(w) => updateWeight(index, w)}
              onRemove={() => removeHolding(index)}
            />
          ))}
        </div>
      )}

      {/* Add holding form */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ticker (e.g. AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            maxLength={10}
            className="flex-1 bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/20 transition-colors"
          />
          <input
            type="number"
            placeholder="Weight %"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onKeyDown={handleKeyDown}
            min={1}
            max={100}
            className="w-28 bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/20 transition-colors"
          />
          <button
            onClick={addHolding}
            className="p-2 rounded-lg bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20 transition-colors border border-accent-gold/20"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {inputError && (
          <div className="flex items-center gap-1.5 text-amber-400 text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            {inputError}
          </div>
        )}
      </div>

      {holdings.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-4">
          Add holdings above or load a preset portfolio
        </p>
      )}
    </div>
  )
}

// Extracted to avoid inline component definition (react-best-practices: rerender-no-inline-components)
interface HoldingRowProps {
  holding: Holding
  onWeightChange: (weight: number) => void
  onRemove: () => void
}

function HoldingRow({ holding, onWeightChange, onRemove }: HoldingRowProps) {
  return (
    <div className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2">
      <span className="font-mono text-sm font-semibold text-slate-100 w-20">{holding.ticker}</span>
      <div className="flex-1">
        <div className="w-full bg-slate-700/50 rounded-full h-1.5">
          <div
            className="bg-accent-gold h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(holding.weight, 100)}%` }}
          />
        </div>
      </div>
      <input
        type="number"
        value={holding.weight}
        onChange={(e) => onWeightChange(parseFloat(e.target.value) || 0)}
        min={1}
        max={100}
        className="w-16 bg-transparent text-right text-sm font-mono text-slate-300 focus:outline-none focus:text-accent-gold"
      />
      <span className="text-slate-500 text-xs">%</span>
      <button
        onClick={onRemove}
        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
