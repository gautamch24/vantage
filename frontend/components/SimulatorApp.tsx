'use client'

import { useState, useCallback } from 'react'
import { PortfolioBuilder } from './PortfolioBuilder'
import { ScenarioSelector } from './ScenarioSelector'
import { ResultsDashboard } from './ResultsDashboard'
import { runSimulation } from '@/lib/api'
import type { Holding, Scenario, SimulateResponse } from '@/types'
import { AlertCircle, PlayCircle } from 'lucide-react'

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
      const data = await runSimulation({
        holdings,
        scenarioId: selectedScenario.id,
      })
      setResult(data)
      setStep('results')
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Simulation failed. Ensure the backend and data service are running.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [holdings, selectedScenario, isReady])

  const handleReset = () => {
    setStep('build')
    setResult(null)
    setError(null)
  }

  if (step === 'results' && result && selectedScenario) {
    return (
      <ResultsDashboard
        result={result}
        scenario={selectedScenario}
        holdings={holdings}
        onReset={handleReset}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Portfolio Builder */}
      <div className="space-y-6">
        <PortfolioBuilder holdings={holdings} onChange={setHoldings} />

        {/* Preset portfolios */}
        <div className="bg-surface-card rounded-xl border border-slate-700/50 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Load Preset
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setHoldings(preset.holdings)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Scenario Selector + Run */}
      <div className="space-y-6">
        <ScenarioSelector selected={selectedScenario} onSelect={setSelectedScenario} />

        {/* Weight validation warning */}
        {holdings.length > 0 && totalWeight !== 100 && (
          <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-400/10 rounded-lg px-4 py-3 border border-amber-400/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Weights sum to {totalWeight}% — must equal 100%
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-3 border border-red-400/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleRunSimulation}
          disabled={!isReady || loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-accent-gold text-slate-900 font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.99] transition-all"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              Running Simulation…
            </>
          ) : (
            <>
              <PlayCircle className="w-5 h-5" />
              Run Stress Test
            </>
          )}
        </button>

        {!isReady && !loading && (
          <p className="text-center text-xs text-slate-500">
            {holdings.length === 0
              ? 'Add at least one holding'
              : !selectedScenario
              ? 'Select a stress scenario'
              : 'Weights must sum to 100%'}
          </p>
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
