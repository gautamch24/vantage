'use client'

import type { SimulateResponse, Scenario, Holding } from '@/types'
import { MetricCards } from './MetricCards'
import { TimeseriesChart } from './TimeseriesChart'
import { HoldingsBreakdown } from './HoldingsBreakdown'
import { NarrativeCard } from './NarrativeCard'
import { ArrowLeft, CalendarRange } from 'lucide-react'
import { formatPercent } from '@/lib/utils'

interface Props {
  result: SimulateResponse
  scenario: Scenario
  holdings: Holding[]
  onReset: () => void
}

export function ResultsDashboard({ result, scenario, holdings, onReset }: Props) {
  const portfolioSummary = holdings
    .map((h) => `${Number(h.weight).toFixed(0)}% ${h.ticker}`)
    .join(', ')

  return (
    <div className="space-y-6">
      {/* Back + scenario header */}
      <div className="flex items-start justify-between gap-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          New Simulation
        </button>
        <div className="text-right">
          <h3 className="font-semibold text-slate-100">{scenario.name}</h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 justify-end mt-0.5">
            <CalendarRange className="w-3 h-3" />
            {scenario.startDate} → {scenario.endDate}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{portfolioSummary}</p>
        </div>
      </div>

      {/* Headline stat */}
      <div className="bg-gradient-to-r from-red-900/20 to-surface-card rounded-xl border border-red-500/20 p-6 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Portfolio Peak-to-Trough Loss</p>
          <p className="text-5xl font-bold font-mono text-red-400 mt-1">
            {formatPercent(result.metrics.maxDrawdown)}
          </p>
          <p className="text-slate-500 text-xs mt-2">
            {result.metrics.recoveryDays
              ? `Recovered in ${result.metrics.recoveryDays} days`
              : 'Did not recover within the scenario window'}
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-slate-400 text-sm">Worst Day</p>
          <p className="text-2xl font-bold font-mono text-orange-400">
            {formatPercent(result.metrics.worstSingleDay)}
          </p>
          <p className="text-slate-400 text-sm mt-3">Beta vs Market</p>
          <p className="text-2xl font-bold font-mono text-blue-400">
            {Number(result.metrics.beta).toFixed(2)}x
          </p>
        </div>
      </div>

      {/* AI Narrative */}
      <NarrativeCard
        scenarioId={scenario.id}
        scenarioName={scenario.name}
        holdings={holdings}
        metrics={result.metrics}
      />

      {/* Metric cards */}
      <div className="bg-surface-card rounded-xl border border-slate-700/50 p-5">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
          Risk Metrics
        </h3>
        <MetricCards metrics={result.metrics} />
      </div>

      {/* Timeseries chart */}
      <div className="bg-surface-card rounded-xl border border-slate-700/50 p-5">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
          Portfolio Value Over Crisis Period
        </h3>
        <TimeseriesChart data={result.timeseries} />
      </div>

      {/* Holdings breakdown */}
      <div className="bg-surface-card rounded-xl border border-slate-700/50 p-5">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
          Holdings Breakdown
        </h3>
        <HoldingsBreakdown breakdown={result.holdingsBreakdown} />
      </div>

      {/* Crisis context */}
      <div className="bg-surface-card rounded-xl border border-slate-700/50 p-5">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">
          Crisis Context
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed">{scenario.crisisSummary}</p>
      </div>
    </div>
  )
}
