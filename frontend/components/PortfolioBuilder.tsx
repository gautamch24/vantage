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

  const weightColor = totalWeight === 100
    ? 'var(--green)'
    : totalWeight > 100
    ? 'var(--red)'
    : 'var(--accent)'

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Holdings
        </h2>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded border"
          style={{
            color: weightColor,
            borderColor: weightColor,
            background: 'transparent',
            opacity: 0.9,
          }}
        >
          {totalWeight}% / 100%
        </span>
      </div>

      {holdings.length === 0 && (
        <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>
          Add holdings below or load a preset
        </p>
      )}

      {holdings.length > 0 && (
        <div className="space-y-1.5 mb-4">
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

      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            maxLength={10}
            className="flex-1 rounded-md px-3 py-2 text-sm font-mono focus:outline-none transition-colors"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-bright)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
          />
          <input
            type="number"
            placeholder="Weight %"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onKeyDown={handleKeyDown}
            min={1}
            max={100}
            className="w-24 rounded-md px-3 py-2 text-sm font-mono focus:outline-none transition-colors"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-bright)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
          />
          <button
            onClick={addHolding}
            className="px-3 rounded-md border transition-colors"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {inputError && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--accent)' }}>
            <AlertTriangle className="w-3 h-3 shrink-0" />
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
    <div
      className="flex items-center gap-3 rounded-md px-3 py-2.5"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <span className="font-mono text-sm font-semibold w-14 shrink-0" style={{ color: 'var(--text-primary)' }}>
        {holding.ticker}
      </span>
      <div className="flex-1">
        <div className="w-full rounded-full h-px" style={{ background: 'var(--border)' }}>
          <div
            className="h-px rounded-full transition-all"
            style={{ width: `${Math.min(holding.weight, 100)}%`, background: 'var(--accent)' }}
          />
        </div>
      </div>
      <input
        type="number"
        value={holding.weight}
        onChange={(e) => onWeightChange(parseFloat(e.target.value) || 0)}
        min={1}
        max={100}
        className="w-12 bg-transparent text-right text-sm font-mono focus:outline-none"
        style={{ color: 'var(--text-secondary)' }}
        onFocus={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
        onBlur={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
      />
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>%</span>
      <button
        onClick={onRemove}
        className="transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
