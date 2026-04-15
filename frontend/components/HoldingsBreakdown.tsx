'use client'

import type { HoldingBreakdown } from '@/types'
import { formatPercent } from '@/lib/utils'

interface Props { breakdown: HoldingBreakdown[] }

export function HoldingsBreakdown({ breakdown }: Props) {
  const sorted = [...breakdown].sort((a, b) => a.drawdown - b.drawdown)
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Ticker', 'Weight', 'Drawdown', 'Severity'].map((h, i) => (
              <th key={h} style={{
                textAlign: i === 0 || i === 3 ? 'left' : 'right',
                paddingBottom: 10, paddingLeft: i === 3 ? 16 : 0,
                fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                textTransform: 'uppercase', letterSpacing: '0.07em',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((h) => <HoldingRow key={h.ticker} holding={h} />)}
        </tbody>
      </table>
    </div>
  )
}

function HoldingRow({ holding }: { holding: HoldingBreakdown }) {
  const pct = holding.drawdown * 100
  const color = pct < -40 ? 'var(--red)' : pct < -20 ? 'var(--amber)' : 'var(--green)'
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '11px 0', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-1)' }}>
        {holding.ticker}
      </td>
      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-3)' }}>
        {Number(holding.weight).toFixed(1)}%
      </td>
      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color }}>
        {formatPercent(holding.drawdown)}
      </td>
      <td style={{ paddingLeft: 16 }}>
        <div style={{ width: 96, height: 3, background: 'var(--bg)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(Math.abs(pct), 100)}%`, background: color, borderRadius: 2 }} />
        </div>
      </td>
    </tr>
  )
}
