'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { TimeseriesPoint } from '@/types'
import { formatDate } from '@/lib/utils'

interface Props {
  data: TimeseriesPoint[]
}

interface TooltipPayload {
  value: number
  payload: { date: string; value: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const delta = d.value - 100
  return (
    <div
      className="rounded-md px-3.5 py-2.5 text-sm shadow-xl"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)' }}
    >
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{formatDate(d.date)}</p>
      <p className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>${d.value.toFixed(2)}</p>
      <p className="text-xs font-medium mt-0.5" style={{ color: delta >= 0 ? 'var(--green)' : 'var(--red)' }}>
        {delta >= 0 ? '+' : ''}{delta.toFixed(2)}%
      </p>
    </div>
  )
}

export function TimeseriesChart({ data }: Props) {
  const values = data.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  const tickIndices = Array.from(
    { length: Math.min(6, data.length) },
    (_, i) => Math.floor((i * (data.length - 1)) / 5),
  )
  const ticks = tickIndices.map((i) => data[i]?.date).filter(Boolean)

  const endValue = data[data.length - 1]?.value ?? 100
  const lineColor = endValue >= 100 ? 'var(--green)' : 'var(--red)'
  const lineColorHex = endValue >= 100 ? '#3fb950' : '#f85149'
  const gradientId = `area-${endValue >= 100 ? 'green' : 'red'}`

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-xs">
        <p style={{ color: 'var(--text-muted)' }}>
          Normalized to <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>$100</span> at scenario start
        </p>
        <div className="flex items-center gap-4 font-mono">
          <span style={{ color: 'var(--green)' }}>↑ ${maxValue.toFixed(2)}</span>
          <span style={{ color: 'var(--red)' }}>↓ ${minValue.toFixed(2)}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={lineColorHex} stopOpacity={0.12} />
              <stop offset="95%" stopColor={lineColorHex} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,246,252,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={(v) => formatDate(v)}
            tick={{ fill: '#484f58', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(240,246,252,0.08)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            tick={{ fill: '#484f58', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={[Math.floor(minValue * 0.97), Math.ceil(maxValue * 1.03)]}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={100}
            stroke="rgba(227,179,65,0.25)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={lineColorHex}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, fill: lineColorHex, stroke: '#0d1117', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
