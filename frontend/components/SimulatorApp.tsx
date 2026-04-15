'use client'

import { useState, useCallback } from 'react'
import { PortfolioBuilder } from './PortfolioBuilder'
import { ScenarioSelector } from './ScenarioSelector'
import { ResultsDashboard } from './ResultsDashboard'
import { runSimulation } from '@/lib/api'
import type { Holding, Scenario, SimulateResponse } from '@/types'
import { cn } from '@/lib/utils'

type Step = 'build' | 'results'

export function SimulatorApp() {
  const [holdings, setHoldings] = useState<Holding[]>([
    { ticker: 'AAPL', weight: 40 },
    { ticker: 'JPM',  weight: 40 },
    { ticker: 'BND',  weight: 20 },
  ])
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [step, setStep] = useState<Step>('build')
  const [result, setResult] = useState<SimulateResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0)
  const isReady = holdings.length > 0 && selectedScenario !== null && totalWeight === 100

  const handleRun = useCallback(async () => {
    if (!selectedScenario || !isReady) return
    setLoading(true)
    setError(null)
    try {
      const data = await runSimulation({ holdings, scenarioId: selectedScenario.id })
      setResult(data)
      setStep('results')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Simulation failed. Ensure backend and data service are running.')
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

  const hint = !holdings.length ? 'Add at least one holding'
    : !selectedScenario ? 'Select a stress scenario'
    : totalWeight !== 100 ? `Weights sum to ${totalWeight}% — must be 100%`
    : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Left */}
      <div className="space-y-4">
        <PortfolioBuilder holdings={holdings} onChange={setHoldings} />

        {/* Presets */}
        <div className="panel p-4">
          <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Preset Portfolios
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setHoldings(preset.holdings)}
                className="panel-inner transition-colors"
                style={{ padding: '5px 12px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.borderColor = 'var(--border-hover)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
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

        {/* Weight warning */}
        {holdings.length > 0 && totalWeight !== 100 && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, fontSize: 13,
            background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)',
            color: 'var(--gold)',
          }}>
            Weights sum to {totalWeight}% — must equal 100%
          </div>
        )}

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, fontSize: 13,
            background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)',
            color: 'var(--red)',
          }}>
            {error}
          </div>
        )}

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={!isReady || loading}
          style={{
            width: '100%', padding: '13px 20px',
            borderRadius: 10, fontSize: 14, fontWeight: 600,
            border: 'none', cursor: isReady && !loading ? 'pointer' : 'not-allowed',
            background: isReady && !loading ? 'var(--gold)' : 'var(--bg-elevated)',
            color: isReady && !loading ? '#060d18' : 'var(--text-3)',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            opacity: isReady || loading ? 1 : 0.6,
            boxShadow: isReady && !loading ? '0 4px 20px rgba(212,175,55,0.25)' : 'none',
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: 16, height: 16, borderRadius: '50%',
                border: '2px solid rgba(224,196,77,0.3)',
                borderTopColor: '#060d18',
                display: 'inline-block',
                animation: 'spin 0.7s linear infinite',
              }} />
              Running simulation...
            </>
          ) : 'Run Stress Test'}
        </button>

        {hint && !loading && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>{hint}</p>
        )}
      </div>
    </div>
  )
}

const PRESETS = [
  { name: 'Tech-Heavy', holdings: [
    { ticker: 'AAPL', weight: 30 }, { ticker: 'MSFT', weight: 30 },
    { ticker: 'GOOGL', weight: 25 }, { ticker: 'AMZN', weight: 15 },
  ]},
  { name: 'Balanced 60/40', holdings: [
    { ticker: 'SPY', weight: 60 }, { ticker: 'BND', weight: 40 },
  ]},
  { name: 'Financial Heavy', holdings: [
    { ticker: 'JPM', weight: 30 }, { ticker: 'GS', weight: 30 },
    { ticker: 'BAC', weight: 20 }, { ticker: 'SPY', weight: 20 },
  ]},
  { name: 'Diversified', holdings: [
    { ticker: 'SPY', weight: 40 }, { ticker: 'BND', weight: 30 },
    { ticker: 'GLD', weight: 15 }, { ticker: 'VNQ', weight: 15 },
  ]},
]
