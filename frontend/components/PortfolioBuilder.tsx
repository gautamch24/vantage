'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Holding } from '@/types'

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
    const t = ticker.trim().toUpperCase()
    const w = parseFloat(weight)
    if (!t) { setInputError('Enter a ticker'); return }
    if (isNaN(w) || w <= 0 || w > 100) { setInputError('Weight must be 1–100'); return }
    if (holdings.some((h) => h.ticker === t)) { setInputError(`${t} already added`); return }
    setInputError(null)
    onChange([...holdings, { ticker: t, weight: w }])
    setTicker('')
    setWeight('')
  }

  const weightColor = totalWeight === 100 ? 'var(--green)' : totalWeight > 100 ? 'var(--red)' : 'var(--amber)'

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 600 }}>Portfolio Holdings</h2>
        <span style={{
          fontFamily: 'monospace', fontSize: 12, fontWeight: 600,
          color: weightColor, padding: '2px 8px', borderRadius: 5,
          border: `1px solid ${weightColor}`, opacity: 0.9,
          background: 'rgba(0,0,0,0.2)',
        }}>
          {totalWeight}%
        </span>
      </div>

      {holdings.length === 0 && (
        <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
          Add holdings below or load a preset
        </p>
      )}

      {holdings.length > 0 && (
        <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {holdings.map((h, i) => (
            <HoldingRow
              key={h.ticker}
              holding={h}
              onWeightChange={(w) => onChange(holdings.map((x, j) => j === i ? { ...x, weight: w } : x))}
              onRemove={() => onChange(holdings.filter((_, j) => j !== i))}
            />
          ))}
        </div>
      )}

      {/* Add row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="field flex-1"
          style={{ padding: '8px 12px' }}
          placeholder="Ticker (e.g. AAPL)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && addHolding()}
          maxLength={10}
        />
        <input
          className="field"
          style={{ padding: '8px 10px', width: 96, fontFamily: 'monospace' }}
          placeholder="Weight %"
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addHolding()}
          min={1} max={100}
        />
        <button
          onClick={addHolding}
          style={{
            width: 38, height: 38, borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg-elevated)', color: 'var(--text-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          <Plus size={15} />
        </button>
      </div>

      {inputError && (
        <p style={{ color: 'var(--amber)', fontSize: 12, marginTop: 6 }}>{inputError}</p>
      )}
    </div>
  )
}

function HoldingRow({ holding, onWeightChange, onRemove }: {
  holding: Holding
  onWeightChange: (w: number) => void
  onRemove: () => void
}) {
  return (
    <div className="panel-inner" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: 'var(--text-1)', width: 54, flexShrink: 0 }}>
        {holding.ticker}
      </span>
      <div style={{ flex: 1, height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(holding.weight, 100)}%`, background: 'var(--gold)', borderRadius: 2, transition: 'width 0.2s' }} />
      </div>
      <input
        type="number"
        value={holding.weight}
        onChange={(e) => onWeightChange(parseFloat(e.target.value) || 0)}
        min={1} max={100}
        style={{
          width: 44, background: 'transparent', border: 'none', outline: 'none',
          textAlign: 'right', fontFamily: 'monospace', fontSize: 13,
          color: 'var(--text-2)', cursor: 'text',
        }}
        onFocus={(e) => { e.currentTarget.style.color = 'var(--text-1)' }}
        onBlur={(e) => { e.currentTarget.style.color = 'var(--text-2)' }}
      />
      <span style={{ color: 'var(--text-3)', fontSize: 12 }}>%</span>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: 2 }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)' }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
