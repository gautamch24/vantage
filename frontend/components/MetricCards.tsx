'use client'

import type { MetricsDto } from '@/types'
import { formatPercent, formatNumber } from '@/lib/utils'

interface Props {
  metrics: MetricsDto
}

export function MetricCards({ metrics }: Props) {
  const cards = buildCards(metrics)
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  )
}

type Sentiment = 'ok' | 'warn' | 'bad'

function buildCards(metrics: MetricsDto) {
  return [
    {
      label: 'Max Drawdown',
      value: formatPercent(metrics.maxDrawdown),
      sub: 'Peak-to-trough',
      sentiment: (metrics.maxDrawdown < -0.3 ? 'bad' : metrics.maxDrawdown < -0.15 ? 'warn' : 'ok') as Sentiment,
    },
    {
      label: 'Worst Single Day',
      value: formatPercent(metrics.worstSingleDay),
      sub: 'Largest 1-day loss',
      sentiment: (metrics.worstSingleDay < -0.07 ? 'bad' : metrics.worstSingleDay < -0.03 ? 'warn' : 'ok') as Sentiment,
    },
    {
      label: 'Recovery Time',
      value: metrics.recoveryDays ? `${metrics.recoveryDays}d` : '—',
      sub: metrics.recoveryDays ? 'Days to prior peak' : 'Not recovered',
      sentiment: (!metrics.recoveryDays ? 'bad' : metrics.recoveryDays > 500 ? 'warn' : 'ok') as Sentiment,
    },
    {
      label: 'Sharpe Ratio',
      value: formatNumber(metrics.sharpeRatio),
      sub: 'Risk-adjusted return',
      sentiment: (metrics.sharpeRatio > 0.5 ? 'ok' : metrics.sharpeRatio > -0.5 ? 'warn' : 'bad') as Sentiment,
    },
    {
      label: 'Ann. Volatility',
      value: formatPercent(metrics.annualizedVolatility),
      sub: 'Std dev annualized',
      sentiment: (metrics.annualizedVolatility > 0.4 ? 'bad' : metrics.annualizedVolatility > 0.2 ? 'warn' : 'ok') as Sentiment,
    },
    {
      label: 'Beta vs S&P 500',
      value: `${formatNumber(metrics.beta)}x`,
      sub: 'Market sensitivity',
      sentiment: (metrics.beta > 1.5 ? 'bad' : metrics.beta > 1.1 ? 'warn' : 'ok') as Sentiment,
    },
  ]
}

const sentimentColor: Record<Sentiment, string> = {
  ok:   'var(--green)',
  warn: 'var(--accent)',
  bad:  'var(--red)',
}

interface MetricCardProps {
  label: string
  value: string
  sub: string
  sentiment: Sentiment
}

function MetricCard({ label, value, sub, sentiment }: MetricCardProps) {
  const color = sentimentColor[sentiment]
  return (
    <div className="card-elevated p-3.5">
      <p className="text-xs mb-2.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-2xl font-bold font-mono leading-none" style={{ color }}>{value}</p>
      <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  )
}
