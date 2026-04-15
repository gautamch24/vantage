'use client'

import { useState, useCallback } from 'react'
import { PortfolioBuilder } from './PortfolioBuilder'
import { ScenarioSelector } from './ScenarioSelector'
import { ResultsDashboard } from './ResultsDashboard'
import { runSimulation } from '@/lib/api'
import type { Holding, Scenario, SimulateResponse } from '@/types'
import { AlertCircle } from 'lucide-react'
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Left */}
      <div className="space-y-4">
        <PortfolioBuilder holdings={holdings} onChange={setHoldings} />

        {/* Presets */}
        <div className="card p-4">
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
            Load preset
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setHoldings(preset.holdings)}
                className="text-xs px-3 py-1.5 rounded-md border transition-colors"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)'
                  e.currentTarget.style.borderColor = 'var(--border-bright)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="space-y-4">
        <ScenarioSelector selected={selectedScenario} onSelect={setSelectedScenario} />

        {holdings.length > 0 && totalWeight !== 100 && (
          <div
            className="flex items-center gap-2 text-xs rounded-md px-3 py-2.5 border"
            style={{ color: '#e3b341', background: 'rgba(227,179,65,0.06)', borderColor: 'rgba(227,179,65,0.2)' }}
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Weights sum to {totalWeight}% — must equal 100%
          </div>
        )}

        {error && (
          <div
            className="flex items-start gap-2 text-xs rounded-md px-3 py-2.5 border"
            style={{ color: 'var(--red)', background: 'rgba(248,81,73,0.06)', borderColor: 'rgba(248,81,73,0.2)' }}
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button
          onClick={handleRunSimulation}
          disabled={!canRun}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-5 py-3 rounded-md text-sm font-medium transition-all border',
            canRun
              ? 'cursor-pointer'
              : 'cursor-not-allowed opacity-40',
          )}
          style={canRun ? {
            background: 'var(--accent)',
            borderColor: 'var(--accent)',
            color: '#0d1117',
          } : {
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          {loading ? (
            <>
              <div
                className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(13,17,23,0.2)', borderTopColor: '#0d1117' }}
              />
              Running simulation...
            </>
          ) : (
            'Run Stress Test'
          )}
        </button>

        {hint && !loading && (
          <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>
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
