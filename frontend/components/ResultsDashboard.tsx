'use client'

import { useState } from 'react'
import type { SimulateResponse, Scenario, Holding } from '@/types'
import { MetricCards } from './MetricCards'
import { TimeseriesChart } from './TimeseriesChart'
import { HoldingsBreakdown } from './HoldingsBreakdown'
import { NarrativeCard } from './NarrativeCard'
import { AgentChat } from './AgentChat'
import { ArrowLeft } from 'lucide-react'
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
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs transition-colors px-2 py-1.5 rounded-md"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          New simulation
        </button>
        <div className="text-right">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{scenario.name}</p>
          <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {scenario.startDate} — {scenario.endDate}
          </p>
        </div>
      </div>

      {/* Drawdown summary card */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              Peak-to-Trough Loss
            </p>
            <p
              className="text-5xl font-bold font-mono leading-none"
              style={{ color: 'var(--red)' }}
            >
              {formatPercent(result.metrics.maxDrawdown)}
            </p>
            <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
              {portfolioSummary}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {result.metrics.recoveryDays
                ? `Recovered in ${result.metrics.recoveryDays} days`
                : 'Did not recover within scenario window'}
            </p>
          </div>

          <div className="hidden sm:grid grid-cols-2 gap-x-8 gap-y-3 shrink-0">
            <StatBox label="Worst Day"  value={formatPercent(result.metrics.worstSingleDay)}           color="var(--red)" />
            <StatBox label="Beta"       value={`${Number(result.metrics.beta).toFixed(2)}x`}           color="var(--blue)" />
            <StatBox label="Volatility" value={formatPercent(result.metrics.annualizedVolatility)}     color="var(--text-secondary)" />
            <StatBox label="Sharpe"     value={Number(result.metrics.sharpeRatio).toFixed(2)}          color="var(--text-secondary)" />
          </div>
        </div>

        {/* Severity bar */}
        <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
            <span>0%</span>
            <span>Drawdown severity</span>
            <span>−100%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(Math.abs(maxDrawdownPct), 100)}%`,
                background: maxDrawdownPct < -40 ? 'var(--red)' : maxDrawdownPct < -20 ? '#e3b341' : 'var(--green)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <TabButton active={tab === 'results'} onClick={() => setTab('results')} label="Risk Analysis" />
        <TabButton active={tab === 'agent'}   onClick={() => setTab('agent')}   label="AI Analyst" badge />
      </div>

      {/* Tab content */}
      {tab === 'results' && (
        <div className="space-y-4 animate-fade-in">
          <Section title="Risk Metrics">
            <MetricCards metrics={result.metrics} />
          </Section>

          <NarrativeCard
            scenarioId={scenario.id}
            scenarioName={scenario.name}
            holdings={holdings}
            metrics={result.metrics}
          />

          <Section title="Portfolio Value">
            <TimeseriesChart data={result.timeseries} />
          </Section>

          <Section title="Holdings Breakdown">
            <HoldingsBreakdown breakdown={result.holdingsBreakdown} />
          </Section>

          <Section title="Crisis Context">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {scenario.crisisSummary}
            </p>
          </Section>
        </div>
      )}

      {tab === 'agent' && (
        <div className="card overflow-hidden animate-fade-in">
          <AgentChat holdings={holdings} />
        </div>
      )}
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-lg font-bold font-mono" style={{ color }}>{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <h3 className="text-xs font-medium mb-4" style={{ color: 'var(--text-muted)' }}>{title}</h3>
      {children}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  label: string
  badge?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
        active ? 'border-b-2' : 'border-transparent',
      )}
      style={{
        borderBottomColor: active ? 'var(--accent)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}
    >
      {label}
      {badge && (
        <span
          className="text-xs px-1.5 py-0.5 rounded border font-mono"
          style={{
            color: 'var(--accent)',
            borderColor: 'rgba(227,179,65,0.3)',
            background: 'rgba(227,179,65,0.06)',
            fontSize: '10px',
          }}
        >
          AI
        </span>
      )}
    </button>
  )
}
