'use client'

import { useState, useCallback } from 'react'
import { PortfolioBuilder } from './PortfolioBuilder'
import { ScenarioSelector } from './ScenarioSelector'
import { ResultsDashboard } from './ResultsDashboard'
import { runSimulation } from '@/lib/api'
import type { Holding, Scenario, SimulateResponse } from '@/types'
import { AlertCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

type Step = 'build' | 'results'

export function SimulatorApp() {
  const [holdings, setHoldings] = useState<Holding[]>([
    { ticker: 'AAPL', weight: 40 },
    { ticker: 'JPM', weight: 40 },
    { ticker: 'BND', weight: 20 },
  ])
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [step, setStep] = useState<Step>('build')
  const [result, setResult] = useState<SimulateResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0)
  const isReady = holdings.length > 0 && selectedScenario !== null && totalWeight === 100

  const handleRunSimulation = useCallback(async () => {
    if (!selectedScenario || !isReady) return
    setLoading(true)
    setError(null)
    try {
      const data = await runSimulation({ holdings, scenarioId: selectedScenario.id })
      setResult(data)
      setStep('results')
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Simulation failed. Ensure the backend and data service are running.',
      )
    } finally {
      setLoading(false)
    }
  }, [holdings, selectedScenario, isReady])

  if (step === 'results' && result && selectedScenario) {
    return (
      <ResultsDashboard
        result={result}
        scenario={selectedScenario}
        holdings={holdings}
        onReset={() => { setStep('build'); setResult(null); setError(null) }}
      />
    )
  }

  const canRun = isReady && !loading
  const hint = !holdings.length
    ? 'Add at least one holding'
    : !selectedScenario
    ? 'Select a stress scenario'
    : totalWeight !== 100
    ? `Weights sum to ${totalWeight}% — must be 100%`
    : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-4">
        <PortfolioBuilder holdings={holdings} onChange={setHoldings} />

        {/* Presets */}
        <div className="glass rounded-2xl border border-[rgba(99,132,184,0.12)] p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Load Preset Portfolio
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setHoldings(preset.holdings)}
                className="text-xs px-3 py-1.5 rounded-lg bg-bg-elevated border border-[rgba(99,132,184,0.1)] text-slate-400 hover:text-slate-200 hover:border-[rgba(99,132,184,0.25)] transition-all"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        <ScenarioSelector selected={selectedScenario} onSelect={setSelectedScenario} />

        {/* Weight warning */}
        {holdings.length > 0 && totalWeight !== 100 && (
          <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-400/8 rounded-xl px-4 py-3 border border-amber-400/15">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Weights sum to {totalWeight}% — must equal 100%
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-red-400 text-xs bg-red-400/8 rounded-xl px-4 py-3 border border-red-400/15">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Run button */}
        <button
          onClick={handleRunSimulation}
          disabled={!canRun}
          className={cn(
            'w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-base transition-all',
            canRun
              ? 'bg-gold text-bg hover:brightness-110 active:scale-[0.99] shadow-lg shadow-gold/10'
              : 'bg-[rgba(212,175,55,0.1)] text-gold/30 border border-gold/10 cursor-not-allowed',
          )}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-bg/20 border-t-bg rounded-full animate-spin" />
              Running Simulation…
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Run Stress Test
            </>
          )}
        </button>

        {hint && !loading && (
          <p className="text-center text-xs text-slate-600">{hint}</p>
        )}
      </div>
    </div>
  )
}

const PRESETS = [
  {
    name: 'Tech-Heavy',
    holdings: [
      { ticker: 'AAPL', weight: 30 },
      { ticker: 'MSFT', weight: 30 },
      { ticker: 'GOOGL', weight: 25 },
      { ticker: 'AMZN', weight: 15 },
    ],
  },
  {
    name: 'Balanced 60/40',
    holdings: [
      { ticker: 'SPY', weight: 60 },
      { ticker: 'BND', weight: 40 },
    ],
  },
  {
    name: 'Financial Heavy',
    holdings: [
      { ticker: 'JPM', weight: 30 },
      { ticker: 'GS', weight: 30 },
      { ticker: 'BAC', weight: 20 },
      { ticker: 'SPY', weight: 20 },
    ],
  },
  {
    name: 'Diversified',
    holdings: [
      { ticker: 'SPY', weight: 40 },
      { ticker: 'BND', weight: 30 },
      { ticker: 'GLD', weight: 15 },
      { ticker: 'VNQ', weight: 15 },
    ],
  },
]
