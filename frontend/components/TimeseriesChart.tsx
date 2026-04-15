'use client'

import {
  LineChart,
  Line,
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
  return (
    <div className="bg-surface-card border border-slate-600/50 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400">{formatDate(d.date)}</p>
      <p className="text-sm font-mono font-bold text-slate-100">
        ${d.value.toFixed(2)}
      </p>
      <p className={`text-xs font-medium ${d.value >= 100 ? 'text-green-400' : 'text-red-400'}`}>
        {d.value >= 100 ? '+' : ''}{(d.value - 100).toFixed(2)}%
      </p>
    </div>
  )
}

// Tick formatters are stable functions — defined at module level (server-hoist-static-io)
function formatXTick(value: string) {
  return formatDate(value)
}

function formatYTick(value: number) {
  return `$${value.toFixed(0)}`
}

export function TimeseriesChart({ data }: Props) {
  const minValue = Math.min(...data.map((d) => d.value))
  const maxValue = Math.max(...data.map((d) => d.value))

  // Sample data for x-axis ticks — show ~6 evenly spaced dates
  const tickIndices = Array.from(
    { length: Math.min(6, data.length) },
    (_, i) => Math.floor((i * (data.length - 1)) / 5),
  )
  const ticks = tickIndices.map((i) => data[i]?.date).filter(Boolean)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-400">
          Portfolio value normalized to{' '}
          <span className="text-slate-200 font-mono">$100</span> at scenario start
        </p>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-green-400">
            Peak: ${maxValue.toFixed(2)}
          </span>
          <span className="text-red-400">
            Trough: ${minValue.toFixed(2)}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={formatXTick}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYTick}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            domain={[Math.floor(minValue * 0.98), Math.ceil(maxValue * 1.02)]}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Baseline at $100 (pre-crisis value) */}
          <ReferenceLine y={100} stroke="#475569" strokeDasharray="4 4" strokeWidth={1} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6', stroke: '#0f172a', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
