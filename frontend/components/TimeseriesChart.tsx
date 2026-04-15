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
      className="rounded-xl px-4 py-3 shadow-2xl border text-sm"
      style={{ background: 'var(--bg-elevated)', borderColor: 'rgba(99,132,184,0.25)' }}
    >
      <p className="text-xs text-slate-500 mb-1">{formatDate(d.date)}</p>
      <p className="font-mono font-bold text-slate-100 text-base">${d.value.toFixed(2)}</p>
      <p className={`text-xs font-medium mt-0.5 ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {delta >= 0 ? '+' : ''}{delta.toFixed(2)}%
      </p>
    </div>
  )
}

function formatXTick(value: string) {
  return formatDate(value)
}

function formatYTick(value: number) {
  return `$${value.toFixed(0)}`
}

export function TimeseriesChart({ data }: Props) {
  const values = data.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const isNegative = minValue < 100

  const tickIndices = Array.from(
    { length: Math.min(6, data.length) },
    (_, i) => Math.floor((i * (data.length - 1)) / 5),
  )
  const ticks = tickIndices.map((i) => data[i]?.date).filter(Boolean)

  // Color based on where portfolio ended
  const endValue = data[data.length - 1]?.value ?? 100
  const lineColor = endValue >= 100 ? '#22c55e' : '#ef4444'
  const gradientId = `area-${isNegative ? 'red' : 'green'}`

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-xs">
        <p className="text-slate-500">
          Normalized to{' '}
          <span className="font-mono text-slate-300">$100</span> at scenario start
        </p>
        <div className="flex items-center gap-4">
          <span className="text-green-400 font-mono">↑ ${maxValue.toFixed(2)}</span>
          <span className="text-red-400 font-mono">↓ ${minValue.toFixed(2)}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.18} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,132,184,0.08)" vertical={false} />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={formatXTick}
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(99,132,184,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYTick}
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={[Math.floor(minValue * 0.97), Math.ceil(maxValue * 1.03)]}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={100}
            stroke="rgba(212,175,55,0.3)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: lineColor, stroke: 'var(--bg)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
