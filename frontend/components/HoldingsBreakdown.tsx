'use client'

import type { HoldingBreakdown } from '@/types'
import { formatPercent } from '@/lib/utils'

interface Props {
  breakdown: HoldingBreakdown[]
}

export function HoldingsBreakdown({ breakdown }: Props) {
  const sorted = [...breakdown].sort((a, b) => a.drawdown - b.drawdown)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th className="text-left text-xs font-medium pb-2.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Ticker</th>
            <th className="text-right text-xs font-medium pb-2.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Weight</th>
            <th className="text-right text-xs font-medium pb-2.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Drawdown</th>
            <th className="text-left text-xs font-medium pb-2.5 pl-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Severity</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((h) => (
            <HoldingRow key={h.ticker} holding={h} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HoldingRow({ holding }: { holding: HoldingBreakdown }) {
  const drawdownPct = holding.drawdown * 100
  const barColor =
    drawdownPct < -40 ? 'var(--red)'
    : drawdownPct < -20 ? '#e3b341'
    : 'var(--green)'

  return (
    <tr
      style={{ borderBottom: '1px solid var(--border)' }}
      className="transition-colors"
      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(240,246,252,0.02)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
    >
      <td className="py-2.5">
        <span className="font-mono font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          {holding.ticker}
        </span>
      </td>
      <td className="text-right py-2.5 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
        {Number(holding.weight).toFixed(1)}%
      </td>
      <td className="text-right py-2.5 font-mono font-bold text-sm" style={{ color: barColor }}>
        {formatPercent(holding.drawdown)}
      </td>
      <td className="pl-4 py-2.5">
        <div className="w-24 rounded-full h-1" style={{ background: 'var(--bg-elevated)' }}>
          <div
            className="h-1 rounded-full"
            style={{ width: `${Math.min(Math.abs(drawdownPct), 100)}%`, background: barColor }}
          />
        </div>
      </td>
    </tr>
  )
}
