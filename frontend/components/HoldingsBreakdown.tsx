'use client'

import type { HoldingBreakdown } from '@/types'
import { formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  breakdown: HoldingBreakdown[]
}

export function HoldingsBreakdown({ breakdown }: Props) {
  const sorted = [...breakdown].sort((a, b) => a.drawdown - b.drawdown)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[rgba(99,132,184,0.1)]">
            <th className="text-left text-xs font-medium text-slate-600 pb-3 uppercase tracking-wider">Ticker</th>
            <th className="text-right text-xs font-medium text-slate-600 pb-3 uppercase tracking-wider">Weight</th>
            <th className="text-right text-xs font-medium text-slate-600 pb-3 uppercase tracking-wider">Drawdown</th>
            <th className="text-left text-xs font-medium text-slate-600 pb-3 pl-5 uppercase tracking-wider">Impact</th>
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
  const severity =
    drawdownPct < -40 ? 'bad' : drawdownPct < -20 ? 'warn' : drawdownPct < -5 ? 'mild' : 'ok'

  const colors = {
    bad:  { text: 'text-red-400',    bar: 'bg-red-500' },
    warn: { text: 'text-orange-400', bar: 'bg-orange-500' },
    mild: { text: 'text-amber-400',  bar: 'bg-amber-500' },
    ok:   { text: 'text-green-400',  bar: 'bg-green-500' },
  }[severity]

  return (
    <tr className="border-b border-[rgba(99,132,184,0.06)] hover:bg-[rgba(99,132,184,0.04)] transition-colors">
      <td className="py-3">
        <span className="font-mono font-bold text-slate-100">{holding.ticker}</span>
      </td>
      <td className="text-right py-3 font-mono text-slate-500 text-xs">
        {Number(holding.weight).toFixed(1)}%
      </td>
      <td className={cn('text-right py-3 font-mono font-bold text-sm', colors.text)}>
        {formatPercent(holding.drawdown)}
      </td>
      <td className="pl-5 py-3">
        <div className="flex items-center gap-2">
          <div className="w-24 bg-[rgba(99,132,184,0.08)] rounded-full h-1.5">
            <div
              className={cn('h-1.5 rounded-full transition-all', colors.bar)}
              style={{ width: `${Math.min(Math.abs(drawdownPct), 100)}%` }}
            />
          </div>
        </div>
      </td>
    </tr>
  )
}
