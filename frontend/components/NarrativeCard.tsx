'use client'

import { useState } from 'react'
import { generateNarrative } from '@/lib/api'
import type { MetricsDto, Holding } from '@/types'
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  scenarioId: string
  scenarioName: string
  holdings: Holding[]
  metrics: MetricsDto
}

export function NarrativeCard({ scenarioId, scenarioName, holdings, metrics }: Props) {
  const [narrative, setNarrative] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  const portfolioSummary = holdings
    .map((h) => `${Number(h.weight).toFixed(0)}% ${h.ticker}`)
    .join(', ')

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const text = await generateNarrative({ portfolioSummary, scenarioId, metrics })
      setNarrative(text)
    } catch {
      setError('Failed to generate. Check that ANTHROPIC_API_KEY is configured.')
    } finally {
      setLoading(false)
    }
  }

  if (narrative) {
    return (
      <div
        className="card p-4"
        style={{ borderColor: 'rgba(227,179,65,0.2)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              AI Narrative
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {scenarioName}
            </span>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {expanded && (
          <div className="space-y-3">
            {narrative.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="card p-4">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            AI Narrative
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Plain-English explanation of what happened, why your holdings were hit, and what it means for your risk profile.
          </p>
          {error && (
            <div className="flex items-center gap-1.5 text-xs mt-2" style={{ color: 'var(--red)' }}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-medium transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            color: 'var(--accent)',
            borderColor: 'rgba(227,179,65,0.3)',
            background: 'rgba(227,179,65,0.06)',
          }}
        >
          {loading ? (
            <>
              <div
                className="w-3 h-3 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(227,179,65,0.3)', borderTopColor: 'var(--accent)' }}
              />
              Generating...
            </>
          ) : (
            'Generate'
          )}
        </button>
      </div>
    </div>
  )
}
