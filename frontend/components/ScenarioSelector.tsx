'use client'

import { useEffect, useState } from 'react'
import { fetchScenarios } from '@/lib/api'
import type { Scenario } from '@/types'
import { cn } from '@/lib/utils'
import { CalendarRange, ChevronRight } from 'lucide-react'

interface Props {
  selected: Scenario | null
  onSelect: (scenario: Scenario) => void
}

// Scenario color accents keyed by name fragment
const SCENARIO_COLORS: Record<string, string> = {
  '2008': 'border-red-500/40 hover:border-red-400/60',
  'COVID': 'border-orange-500/40 hover:border-orange-400/60',
  'Dot-com': 'border-purple-500/40 hover:border-purple-400/60',
  '2022': 'border-blue-500/40 hover:border-blue-400/60',
  'Black': 'border-amber-500/40 hover:border-amber-400/60',
}

function scenarioBorderClass(name: string): string {
  for (const [key, cls] of Object.entries(SCENARIO_COLORS)) {
    if (name.includes(key)) return cls
  }
  return 'border-slate-600/40 hover:border-slate-500/60'
}

export function ScenarioSelector({ selected, onSelect }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchScenarios()
      .then(setScenarios)
      .catch(() => setError('Failed to load scenarios. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-surface-card rounded-xl border border-slate-700/50 p-5">
      <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
        Stress Scenario
      </h2>

      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-700/30 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {!loading && !error && (
        <div className="space-y-2">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              isSelected={selected?.id === scenario.id}
              borderClass={scenarioBorderClass(scenario.name)}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Extracted to avoid inline component definition
interface ScenarioCardProps {
  scenario: Scenario
  isSelected: boolean
  borderClass: string
  onSelect: (s: Scenario) => void
}

function ScenarioCard({ scenario, isSelected, borderClass, onSelect }: ScenarioCardProps) {
  return (
    <button
      onClick={() => onSelect(scenario)}
      className={cn(
        'w-full text-left rounded-lg border p-3 transition-all',
        isSelected
          ? 'bg-accent-gold/10 border-accent-gold/50 ring-1 ring-accent-gold/20'
          : cn('bg-slate-800/30', borderClass),
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold', isSelected ? 'text-accent-gold' : 'text-slate-200')}>
            {scenario.name}
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
            <CalendarRange className="w-3 h-3" />
            {scenario.startDate} → {scenario.endDate}
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{scenario.description}</p>
        </div>
        <ChevronRight
          className={cn(
            'w-4 h-4 shrink-0 mt-0.5 transition-transform',
            isSelected ? 'text-accent-gold rotate-90' : 'text-slate-600',
          )}
        />
      </div>
    </button>
  )
}
