'use client'

import { useState } from 'react'
import type { SimulateResponse, Scenario, Holding } from '@/types'
import { MetricCards } from './MetricCards'
import { TimeseriesChart } from './TimeseriesChart'
import { HoldingsBreakdown } from './HoldingsBreakdown'
import { NarrativeCard } from './NarrativeCard'
import { AgentChat } from './AgentChat'
import { ArrowLeft, BarChart3, Bot, CalendarRange } from 'lucide-react'
import { formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  result: SimulateResponse
  scenario: Scenario
  holdings: Holding[]
  onReset: () => void
}

type Tab = 'results' | 'agent'

export function ResultsDashboard({ result, scenario, holdings, onReset }: Props) {
  const [tab, setTab] = useState<Tab>('results')

  const portfolioSummary = holdings
    .map((h) => `${Number(h.weight).toFixed(0)}% ${h.ticker}`)
    .join(', ')

  const maxDrawdownPct = result.metrics.maxDrawdown * 100

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-2 rounded-lg hover:bg-[rgba(99,132,184,0.06)]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          New Simulation
        </button>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-200">{scenario.name}</p>
          <p className="flex items-center gap-1 text-xs text-slate-600 justify-end mt-0.5">
            <CalendarRange className="w-3 h-3" />
            {scenario.startDate} → {scenario.endDate}
          </p>
        </div>
      </div>

      {/* Headline drawdown card */}
      <div
        className="rounded-2xl border p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(14,21,32,0.6) 100%)',
          borderColor: 'rgba(239,68,68,0.15)',
        }}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
              Peak-to-Trough Loss
            </p>
            <p
              className="text-6xl font-black font-mono leading-none"
              style={{ color: '#ef4444' }}
            >
              {formatPercent(result.metrics.maxDrawdown)}
            </p>
            <p className="text-xs text-slate-600 mt-3 max-w-sm">
              {portfolioSummary}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {result.metrics.recoveryDays
                ? `Recovered in ${result.metrics.recoveryDays} trading days`
                : 'Did not recover within scenario window'}
            </p>
          </div>

          <div className="hidden sm:grid grid-cols-2 gap-x-8 gap-y-4 shrink-0">
            <StatBox label="Worst Day" value={formatPercent(result.metrics.worstSingleDay)} color="text-orange-400" />
            <StatBox label="Beta" value={`${Number(result.metrics.beta).toFixed(2)}x`} color="text-blue-400" />
            <StatBox label="Volatility" value={formatPercent(result.metrics.annualizedVolatility)} color="text-purple-400" />
            <StatBox label="Sharpe" value={Number(result.metrics.sharpeRatio).toFixed(2)} color="text-amber-400" />
          </div>
        </div>

        {/* Drawdown severity bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
            <span>0%</span>
            <span className="text-slate-400">Drawdown severity</span>
            <span>−100%</span>
          </div>
          <div className="h-1.5 bg-[rgba(99,132,184,0.1)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(Math.abs(maxDrawdownPct), 100)}%`,
                background: maxDrawdownPct < -40
                  ? '#ef4444'
                  : maxDrawdownPct < -20
                  ? '#f97316'
                  : '#eab308',
              }}
            />
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-card border border-[rgba(99,132,184,0.1)]">
        <TabButton
          active={tab === 'results'}
          onClick={() => setTab('results')}
          icon={<BarChart3 className="w-3.5 h-3.5" />}
          label="Risk Analysis"
        />
        <TabButton
          active={tab === 'agent'}
          onClick={() => setTab('agent')}
          icon={<Bot className="w-3.5 h-3.5" />}
          label="AI Analyst"
          badge
        />
      </div>

      {/* Tab content */}
      {tab === 'results' && (
        <div className="space-y-5 animate-fade-in">
          {/* Metrics */}
          <Section title="Risk Metrics">
            <MetricCards metrics={result.metrics} />
          </Section>

          {/* AI Narrative */}
          <NarrativeCard
            scenarioId={scenario.id}
            scenarioName={scenario.name}
            holdings={holdings}
            metrics={result.metrics}
          />

          {/* Chart */}
          <Section title="Portfolio Value Over Crisis Period">
            <TimeseriesChart data={result.timeseries} />
          </Section>

          {/* Holdings */}
          <Section title="Holdings Breakdown">
            <HoldingsBreakdown breakdown={result.holdingsBreakdown} />
          </Section>

          {/* Crisis context */}
          <Section title="Crisis Context">
            <p className="text-slate-500 text-sm leading-relaxed">{scenario.crisisSummary}</p>
          </Section>
        </div>
      )}

      {tab === 'agent' && (
        <div className="glass rounded-2xl border border-[rgba(99,132,184,0.12)] overflow-hidden animate-fade-in">
          <AgentChat holdings={holdings} />
        </div>
      )}
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-xs text-slate-600 mb-0.5">{label}</p>
      <p className={cn('text-xl font-bold font-mono', color)}>{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl border border-[rgba(99,132,184,0.12)] p-5">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
        active
          ? 'bg-bg-elevated text-slate-100 shadow-sm border border-[rgba(99,132,184,0.15)]'
          : 'text-slate-500 hover:text-slate-400',
      )}
    >
      {icon}
      {label}
      {badge && (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-gold/10 text-gold/80 border border-gold/15">
          AI
        </span>
      )}
    </button>
  )
}
