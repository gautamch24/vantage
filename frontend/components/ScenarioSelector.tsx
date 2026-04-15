'use client'

import { useEffect, useState } from 'react'
import { fetchScenarios } from '@/lib/api'
import type { Scenario } from '@/types'
import { cn } from '@/lib/utils'
import { CalendarRange, TrendingDown, CheckCircle2 } from 'lucide-react'

interface Props {
  selected: Scenario | null
  onSelect: (scenario: Scenario) => void
}

const SCENARIO_STYLES: Record<string, { text: string; bg: string; border: string; ring: string }> = {
  '2008':    { text: 'text-red-400',    bg: 'bg-red-500/8',    border: 'border-red-500/25',    ring: 'ring-red-500/20' },
  'COVID':   { text: 'text-orange-400', bg: 'bg-orange-500/8', border: 'border-orange-500/25', ring: 'ring-orange-500/20' },
  'Dot':     { text: 'text-purple-400', bg: 'bg-purple-500/8', border: 'border-purple-500/25', ring: 'ring-purple-500/20' },
  '2022':    { text: 'text-amber-400',  bg: 'bg-amber-500/8',  border: 'border-amber-500/25',  ring: 'ring-amber-500/20' },
  'Global':  { text: 'text-blue-400',   bg: 'bg-blue-500/8',   border: 'border-blue-500/25',   ring: 'ring-blue-500/20' },
}

function getStyle(name: string) {
  for (const [key, style] of Object.entries(SCENARIO_STYLES)) {
    if (name.includes(key)) return style
  }
  return { text: 'text-slate-300', bg: 'bg-slate-500/8', border: 'border-slate-500/20', ring: 'ring-slate-500/15' }
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
    <div className="glass rounded-2xl border border-[rgba(99,132,184,0.12)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Stress Scenario
        </h2>
        {selected && (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Selected
          </span>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shimmer h-16 rounded-xl" />
          ))}
        </div>
      )}

      {loadError && <p className="text-red-400 text-sm">{loadError}</p>}

      {!loading && !loadError && (
        <div className="space-y-2">
          {scenarios.map((scenario) => {
            const style = getStyle(scenario.name)
            const isSelected = selected?.id === scenario.id
            return (
              <button
                key={scenario.id}
                onClick={() => onSelect(scenario)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl border transition-all duration-150',
                  isSelected
                    ? `${style.bg} ${style.border} ring-1 ${style.ring}`
                    : 'border-[rgba(99,132,184,0.08)] hover:border-[rgba(99,132,184,0.2)] bg-[rgba(20,30,46,0.4)]',
                )}
              >
                <div className="flex items-start gap-3">
                  <TrendingDown
                    className={cn(
                      'w-3.5 h-3.5 shrink-0 mt-0.5 transition-opacity',
                      isSelected ? `${style.text} opacity-100` : 'opacity-0',
                    )}
                  />
                  <div className="flex-1 min-w-0 -ml-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('text-sm font-semibold', isSelected ? style.text : 'text-slate-200')}>
                        {scenario.name}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-600 shrink-0">
                        <CalendarRange className="w-3 h-3" />
                        <span className="font-mono">{scenario.startDate.slice(0, 7)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                      {scenario.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
