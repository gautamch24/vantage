'use client'

import { useEffect, useState } from 'react'
import { fetchScenarios } from '@/lib/api'
import type { Scenario } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  selected: Scenario | null
  onSelect: (scenario: Scenario) => void
}

export function ScenarioSelector({ selected, onSelect }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    fetchScenarios()
      .then(setScenarios)
      .catch(() => setLoadError('Failed to load scenarios. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Stress Scenario
        </h2>
        {selected && (
          <span className="text-xs font-mono" style={{ color: 'var(--green)' }}>
            Selected
          </span>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shimmer h-14" />
          ))}
        </div>
      )}

      {loadError && (
        <p className="text-xs" style={{ color: 'var(--red)' }}>{loadError}</p>
      )}

      {!loading && !loadError && (
        <div className="space-y-1.5">
          {scenarios.map((scenario) => {
            const isSelected = selected?.id === scenario.id
            return (
              <button
                key={scenario.id}
                onClick={() => onSelect(scenario)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-md border transition-colors',
                )}
                style={{
                  background: isSelected ? 'rgba(227,179,65,0.08)' : 'var(--bg-elevated)',
                  borderColor: isSelected ? 'rgba(227,179,65,0.35)' : 'var(--border)',
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="text-sm font-medium"
                    style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}
                  >
                    {scenario.name}
                  </span>
                  <span
                    className="text-xs font-mono shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {scenario.startDate?.slice(0, 7)}
                  </span>
                </div>
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                  {scenario.description}
                </p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
