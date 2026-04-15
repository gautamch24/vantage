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
    <div>
      <p className="text-xs text-slate-400 mb-3">Individual holding performance during the scenario period</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left text-xs font-semibold text-slate-400 pb-2">Ticker</th>
              <th className="text-right text-xs font-semibold text-slate-400 pb-2">Weight</th>
              <th className="text-right text-xs font-semibold text-slate-400 pb-2">Max Drawdown</th>
              <th className="text-left text-xs font-semibold text-slate-400 pb-2 pl-4">Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {sorted.map((h) => (
              <HoldingRow key={h.ticker} holding={h} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function HoldingRow({ holding }: { holding: HoldingBreakdown }) {
  const drawdownPct = holding.drawdown * 100
  const severity =
    drawdownPct < -40 ? 'bad' : drawdownPct < -20 ? 'warn' : drawdownPct < -5 ? 'mild' : 'ok'

  const severityColor = {
    bad: 'text-red-400',
    warn: 'text-orange-400',
    mild: 'text-amber-400',
    ok: 'text-green-400',
  }[severity]

  const barColor = {
    bad: 'bg-red-500',
    warn: 'bg-orange-500',
    mild: 'bg-amber-500',
    ok: 'bg-green-500',
  }[severity]

  return (
    <tr className="hover:bg-slate-800/30 transition-colors">
      <td className="py-2.5">
        <span className="font-mono font-semibold text-slate-100">{holding.ticker}</span>
      </td>
      <td className="text-right py-2.5 text-slate-400 font-mono">{Number(holding.weight).toFixed(1)}%</td>
      <td className={cn('text-right py-2.5 font-mono font-semibold', severityColor)}>
        {formatPercent(holding.drawdown)}
      </td>
      <td className="pl-4 py-2.5">
        <div className="w-32 bg-slate-700/50 rounded-full h-1.5">
          <div
            className={cn('h-1.5 rounded-full', barColor)}
            style={{ width: `${Math.min(Math.abs(drawdownPct), 100)}%` }}
          />
        </div>
      </td>
    </tr>
  )
}
