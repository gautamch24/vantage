'use client'

import type { MetricsDto } from '@/types'
import { formatPercent, formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { TrendingDown, Zap, Clock, BarChart2, Activity, Target } from 'lucide-react'

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

// Derived outside component to avoid re-computation on each render
function buildCards(metrics: MetricsDto) {
  return [
    {
      label: 'Max Drawdown',
      value: formatPercent(metrics.maxDrawdown),
      sub: 'Peak-to-trough loss',
      icon: TrendingDown,
      sentiment: metrics.maxDrawdown < -0.3 ? 'bad' : metrics.maxDrawdown < -0.15 ? 'warn' : 'ok',
    },
    {
      label: 'Worst Single Day',
      value: formatPercent(metrics.worstSingleDay),
      sub: 'Largest 1-day drop',
      icon: Zap,
      sentiment: metrics.worstSingleDay < -0.07 ? 'bad' : metrics.worstSingleDay < -0.03 ? 'warn' : 'ok',
    },
    {
      label: 'Recovery Time',
      value: metrics.recoveryDays ? `${metrics.recoveryDays} days` : 'Not recovered',
      sub: metrics.recoveryDays ? 'Days to prior peak' : 'Within scenario window',
      icon: Clock,
      sentiment: !metrics.recoveryDays ? 'bad' : metrics.recoveryDays > 500 ? 'warn' : 'ok',
    },
    {
      label: 'Sharpe Ratio',
      value: formatNumber(metrics.sharpeRatio),
      sub: 'Risk-adjusted return',
      icon: BarChart2,
      sentiment: metrics.sharpeRatio > 0.5 ? 'ok' : metrics.sharpeRatio > -0.5 ? 'warn' : 'bad',
    },
    {
      label: 'Annualized Volatility',
      value: formatPercent(metrics.annualizedVolatility),
      sub: 'Std dev of daily returns',
      icon: Activity,
      sentiment: metrics.annualizedVolatility > 0.4 ? 'bad' : metrics.annualizedVolatility > 0.2 ? 'warn' : 'ok',
    },
    {
      label: 'Beta vs S&P 500',
      value: formatNumber(metrics.beta),
      sub: 'Market sensitivity',
      icon: Target,
      sentiment: metrics.beta > 1.5 ? 'bad' : metrics.beta > 1.1 ? 'warn' : 'ok',
    },
  ] as const
}

type Sentiment = 'ok' | 'warn' | 'bad'

interface MetricCardProps {
  label: string
  value: string
  sub: string
  icon: React.ComponentType<{ className?: string }>
  sentiment: Sentiment
}

const sentimentStyles: Record<Sentiment, { value: string; border: string; bg: string }> = {
  ok: { value: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/5' },
  warn: { value: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
  bad: { value: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5' },
}

function MetricCard({ label, value, sub, icon: Icon, sentiment }: MetricCardProps) {
  const styles = sentimentStyles[sentiment]
  return (
    <div
      className={cn(
        'rounded-xl border p-4 flex flex-col gap-2',
        styles.border,
        styles.bg,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <Icon className={cn('w-4 h-4', styles.value)} />
      </div>
      <p className={cn('text-2xl font-bold font-mono', styles.value)}>{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  )
}
