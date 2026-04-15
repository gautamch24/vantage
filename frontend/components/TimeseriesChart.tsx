'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import type { TimeseriesPoint } from '@/types'
import { formatDate } from '@/lib/utils'

interface TooltipPayload { value: number; payload: { date: string; value: number } }

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const delta = d.value - 100
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border-hover)',
      borderRadius: 8, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
    }}>
      <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{formatDate(d.date)}</p>
      <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>
        ${d.value.toFixed(2)}
      </p>
      <p style={{ fontSize: 12, fontWeight: 600, color: delta >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>
        {delta >= 0 ? '+' : ''}{delta.toFixed(2)}%
      </p>
    </div>
  )
}

export function TimeseriesChart({ data }: { data: TimeseriesPoint[] }) {
  const values = data.map((d) => d.value)
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const endV = data[data.length - 1]?.value ?? 100
  const hex = endV >= 100 ? '#4ade80' : '#f87171'
  const gid = `g-${endV >= 100 ? 'g' : 'r'}`

  const ticks = Array.from({ length: Math.min(6, data.length) }, (_, i) =>
    data[Math.floor((i * (data.length - 1)) / 5)]?.date,
  ).filter(Boolean)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: 12 }}>
        <span style={{ color: 'var(--text-3)' }}>
          Normalized to <span style={{ fontFamily: 'monospace', color: 'var(--text-2)' }}>$100</span> at scenario start
        </span>
        <div style={{ display: 'flex', gap: 16, fontFamily: 'monospace', fontWeight: 600 }}>
          <span style={{ color: 'var(--green)' }}>↑ ${maxV.toFixed(2)}</span>
          <span style={{ color: 'var(--red)' }}>↓ ${minV.toFixed(2)}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={hex} stopOpacity={0.2} />
              <stop offset="100%" stopColor={hex} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(100,140,200,0.08)" vertical={false} />
          <XAxis
            dataKey="date" ticks={ticks}
            tickFormatter={(v) => formatDate(v)}
            tick={{ fill: '#3d5068', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(100,140,200,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            tick={{ fill: '#3d5068', fontSize: 10 }}
            axisLine={false} tickLine={false}
            domain={[Math.floor(minV * 0.97), Math.ceil(maxV * 1.03)]}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={100} stroke="rgba(212,175,55,0.3)" strokeDasharray="4 4" strokeWidth={1} />
          <Area
            type="monotone" dataKey="value"
            stroke={hex} strokeWidth={2}
            fill={`url(#${gid})`} dot={false}
            activeDot={{ r: 4, fill: hex, stroke: 'var(--bg)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
