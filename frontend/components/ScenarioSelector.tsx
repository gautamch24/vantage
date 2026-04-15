'use client'

import { useEffect, useState } from 'react'
import { fetchScenarios } from '@/lib/api'
import type { Scenario } from '@/types'

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
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 600 }}>Stress Scenario</h2>
        {selected && (
          <span style={{ color: 'var(--green)', fontSize: 12, fontFamily: 'monospace' }}>Selected</span>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[...Array(5)].map((_, i) => <div key={i} className="shimmer" style={{ height: 56 }} />)}
        </div>
      )}

      {loadError && <p style={{ color: 'var(--red)', fontSize: 13 }}>{loadError}</p>}

      {!loading && !loadError && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {scenarios.map((scenario) => {
            const isSelected = selected?.id === scenario.id
            return (
              <button
                key={scenario.id}
                onClick={() => onSelect(scenario)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${isSelected ? 'rgba(212,175,55,0.35)' : 'var(--border)'}`,
                  borderLeft: `3px solid ${isSelected ? 'var(--gold)' : 'transparent'}`,
                  background: isSelected ? 'rgba(212,175,55,0.06)' : 'var(--bg-elevated)',
                  transition: 'all 0.12s',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-hover)' }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: isSelected ? 'var(--gold)' : 'var(--text-1)',
                  }}>
                    {scenario.name}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-3)', flexShrink: 0 }}>
                    {scenario.startDate?.slice(0, 7)}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
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
