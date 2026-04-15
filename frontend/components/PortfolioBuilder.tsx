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

    if (!tickerVal) { setInputError('Enter a ticker symbol'); return }
    if (isNaN(weightVal) || weightVal <= 0 || weightVal > 100) { setInputError('Weight must be 1–100'); return }
    if (holdings.some((h) => h.ticker === tickerVal)) { setInputError(`${tickerVal} already added`); return }

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
    <div className="glass rounded-2xl border border-[rgba(99,132,184,0.12)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Portfolio Holdings
        </h2>
        <div
          className={cn(
            'text-xs font-mono px-2.5 py-1 rounded-lg border',
            totalWeight === 100
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : totalWeight > 100
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
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

      {holdings.length === 0 && (
        <p className="text-slate-600 text-sm text-center py-5">
          Add holdings below or load a preset
        </p>
      )}

      {/* Add form */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ticker (e.g. AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            maxLength={10}
            className="flex-1 bg-bg-elevated border border-[rgba(99,132,184,0.12)] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/10 transition-all"
          />
          <input
            type="number"
            placeholder="Weight %"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onKeyDown={handleKeyDown}
            min={1}
            max={100}
            className="w-24 bg-bg-elevated border border-[rgba(99,132,184,0.12)] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/10 transition-all"
          />
          <button
            onClick={addHolding}
            className="p-2.5 rounded-xl bg-gold/10 text-gold hover:bg-gold/20 transition-all border border-gold/15 active:scale-95"
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
    </div>
  )
}

interface HoldingRowProps {
  holding: Holding
  onWeightChange: (weight: number) => void
  onRemove: () => void
}

function HoldingRow({ holding, onWeightChange, onRemove }: HoldingRowProps) {
  return (
    <div className="flex items-center gap-3 bg-bg-elevated rounded-xl px-3.5 py-2.5 border border-[rgba(99,132,184,0.08)]">
      <span className="font-mono text-sm font-bold text-slate-100 w-16 shrink-0">{holding.ticker}</span>
      <div className="flex-1">
        <div className="w-full bg-[rgba(99,132,184,0.08)] rounded-full h-1">
          <div
            className="bg-gold h-1 rounded-full transition-all"
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
        className="w-14 bg-transparent text-right text-sm font-mono text-slate-400 focus:outline-none focus:text-gold"
      />
      <span className="text-slate-600 text-xs">%</span>
      <button
        onClick={onRemove}
        className="p-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
