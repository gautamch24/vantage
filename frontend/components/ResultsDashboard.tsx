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

type Tab = 'results' | 'agent'

interface Props {
  result: SimulateResponse
  scenario: Scenario
  holdings: Holding[]
  onReset: () => void
}

export function ResultsDashboard({ result, scenario, holdings, onReset }: Props) {
  const [tab, setTab] = useState<Tab>('results')
  const portfolioLabel = holdings.map((h) => `${Number(h.weight).toFixed(0)}% ${h.ticker}`).join(', ')
  const pct = result.metrics.maxDrawdown * 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onReset}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
            color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px 0',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-2)' }}
        >
          <ArrowLeft size={14} /> New simulation
        </button>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{scenario.name}</p>
          <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-3)', marginTop: 2 }}>
            {scenario.startDate} — {scenario.endDate}
          </p>
        </div>
      </div>

      {/* Drawdown hero */}
      <div className="panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Peak-to-Trough Loss
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: 60, fontWeight: 800, lineHeight: 1, color: 'var(--red)', letterSpacing: '-0.02em' }}>
              {formatPercent(result.metrics.maxDrawdown)}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 10 }}>{portfolioLabel}</p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
              {result.metrics.recoveryDays
                ? `Recovered in ${result.metrics.recoveryDays} days`
                : 'Did not recover within scenario window'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 36px', flexShrink: 0 }} className="hidden sm:grid">
            <MiniStat label="Worst Day"  value={formatPercent(result.metrics.worstSingleDay)}       color="var(--red)" />
            <MiniStat label="Beta"       value={`${Number(result.metrics.beta).toFixed(2)}x`}       color="var(--blue)" />
            <MiniStat label="Volatility" value={formatPercent(result.metrics.annualizedVolatility)} color="var(--text-2)" />
            <MiniStat label="Sharpe"     value={Number(result.metrics.sharpeRatio).toFixed(2)}      color="var(--text-2)" />
          </div>
        </div>

        {/* Severity bar */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>
            <span>0%</span>
            <span>Drawdown severity</span>
            <span>−100%</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2, transition: 'width 0.5s ease',
              width: `${Math.min(Math.abs(pct), 100)}%`,
              background: pct < -40 ? 'var(--red)' : pct < -20 ? 'var(--amber)' : 'var(--green)',
            }} />
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)' }}>
        {(['results', 'agent'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t ? 'var(--gold)' : 'transparent'}`,
              color: tab === t ? 'var(--text-1)' : 'var(--text-2)',
              marginBottom: -1, display: 'flex', alignItems: 'center', gap: 8,
              transition: 'color 0.12s',
            }}
          >
            {t === 'results' ? 'Risk Analysis' : 'AI Analyst'}
            {t === 'agent' && (
              <span style={{
                fontSize: 10, padding: '1px 6px', borderRadius: 4,
                background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)',
                color: 'var(--gold)', fontFamily: 'monospace',
              }}>AI</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in">
          <Section title="Risk Metrics"><MetricCards metrics={result.metrics} /></Section>
          <NarrativeCard scenarioId={scenario.id} scenarioName={scenario.name} holdings={holdings} metrics={result.metrics} />
          <Section title="Portfolio Value Over Crisis Period"><TimeseriesChart data={result.timeseries} /></Section>
          <Section title="Holdings Breakdown"><HoldingsBreakdown breakdown={result.holdingsBreakdown} /></Section>
          <Section title="Crisis Context">
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65 }}>{scenario.crisisSummary}</p>
          </Section>
        </div>
      )}

      {tab === 'agent' && (
        <div className="panel animate-fade-in" style={{ overflow: 'hidden' }}>
          <AgentChat holdings={holdings} />
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color }}>{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel" style={{ padding: '20px 24px' }}>
      <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
        {title}
      </h3>
      {children}
    </div>
  )
}
