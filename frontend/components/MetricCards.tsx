'use client'

import type { MetricsDto } from '@/types'
import { formatPercent, formatNumber } from '@/lib/utils'

interface Props { metrics: MetricsDto }

type Sentiment = 'ok' | 'warn' | 'bad'

const sentimentColor: Record<Sentiment, string> = {
  ok:   'var(--green)',
  warn: 'var(--amber)',
  bad:  'var(--red)',
}

export function MetricCards({ metrics }: Props) {
  const cards = buildCards(metrics)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}
      className="grid-cols-2 md:grid-cols-3">
      {cards.map((c) => <MetricCard key={c.label} {...c} />)}
    </div>
  )
}

function buildCards(m: MetricsDto) {
  return [
    { label: 'Max Drawdown',    value: formatPercent(m.maxDrawdown),            sub: 'Peak-to-trough',      sentiment: (m.maxDrawdown < -0.3 ? 'bad' : m.maxDrawdown < -0.15 ? 'warn' : 'ok') as Sentiment },
    { label: 'Worst Single Day',value: formatPercent(m.worstSingleDay),         sub: 'Largest 1-day loss',  sentiment: (m.worstSingleDay < -0.07 ? 'bad' : m.worstSingleDay < -0.03 ? 'warn' : 'ok') as Sentiment },
    { label: 'Recovery Time',   value: m.recoveryDays ? `${m.recoveryDays}d` : '—', sub: m.recoveryDays ? 'Days to prior peak' : 'Not recovered', sentiment: (!m.recoveryDays ? 'bad' : m.recoveryDays > 500 ? 'warn' : 'ok') as Sentiment },
    { label: 'Sharpe Ratio',    value: formatNumber(m.sharpeRatio),             sub: 'Risk-adjusted return', sentiment: (m.sharpeRatio > 0.5 ? 'ok' : m.sharpeRatio > -0.5 ? 'warn' : 'bad') as Sentiment },
    { label: 'Ann. Volatility', value: formatPercent(m.annualizedVolatility),   sub: 'Std dev annualized',   sentiment: (m.annualizedVolatility > 0.4 ? 'bad' : m.annualizedVolatility > 0.2 ? 'warn' : 'ok') as Sentiment },
    { label: 'Beta vs S&P 500', value: `${formatNumber(m.beta)}x`,             sub: 'Market sensitivity',   sentiment: (m.beta > 1.5 ? 'bad' : m.beta > 1.1 ? 'warn' : 'ok') as Sentiment },
  ]
}

function MetricCard({ label, value, sub, sentiment }: { label: string; value: string; sub: string; sentiment: Sentiment }) {
  const color = sentimentColor[sentiment]
  return (
    <div className="metric-card" style={{ borderLeftColor: color }}>
      <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'monospace', fontSize: 26, fontWeight: 700, lineHeight: 1, color, marginBottom: 6 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</p>
    </div>
  )
}
