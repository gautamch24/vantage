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
      value: metrics.recoveryDays ? `${metrics.recoveryDays}d` : '—',
      sub: metrics.recoveryDays ? 'Days to prior peak' : 'Not recovered in window',
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
      label: 'Ann. Volatility',
      value: formatPercent(metrics.annualizedVolatility),
      sub: 'Std dev of daily returns',
      icon: Activity,
      sentiment: metrics.annualizedVolatility > 0.4 ? 'bad' : metrics.annualizedVolatility > 0.2 ? 'warn' : 'ok',
    },
    {
      label: 'Beta vs S&P 500',
      value: formatNumber(metrics.beta) + 'x',
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

const styles: Record<Sentiment, { value: string; icon: string; border: string; dot: string }> = {
  ok:   { value: 'text-green-400',  icon: 'text-green-400/60',  border: 'border-green-500/15',  dot: 'bg-green-500' },
  warn: { value: 'text-amber-400',  icon: 'text-amber-400/60',  border: 'border-amber-500/15',  dot: 'bg-amber-500' },
  bad:  { value: 'text-red-400',    icon: 'text-red-400/60',    border: 'border-red-500/15',    dot: 'bg-red-500' },
}

function MetricCard({ label, value, sub, icon: Icon, sentiment }: MetricCardProps) {
  const s = styles[sentiment]
  return (
    <div className={cn('glass-elevated rounded-xl border p-4', s.border)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <Icon className={cn('w-3.5 h-3.5', s.icon)} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn('text-2xl font-bold font-mono leading-none', s.value)}>{value}</span>
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
      </div>
      <p className="text-xs text-slate-600 mt-1.5">{sub}</p>
    </div>
  )
}
