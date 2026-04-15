'use client'

import { useState } from 'react'
import { generateNarrative } from '@/lib/api'
import type { MetricsDto, Holding } from '@/types'
import { Sparkles, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

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
      setError('Failed to generate narrative. Check that ANTHROPIC_API_KEY is configured.')
    } finally {
      setLoading(false)
    }
  }

  if (narrative) {
    return (
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl border border-accent-gold/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-gold" />
            <span className="text-sm font-semibold text-slate-200">AI Analysis</span>
            <span className="text-xs text-slate-500">— Goldman Sachs AWM perspective</span>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {expanded && (
          <div className="prose prose-sm prose-invert max-w-none">
            {narrative.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-slate-300 leading-relaxed text-sm mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-surface-card rounded-xl border border-slate-700/50 p-5">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-accent-gold" />
            <span className="text-sm font-semibold text-slate-200">AI Narrative</span>
          </div>
          <p className="text-xs text-slate-400">
            Generate a plain-English explanation of these results — what caused the crisis,
            why your portfolio was affected, and what it means for your risk profile.
          </p>
          {error && (
            <div className="flex items-center gap-1.5 text-red-400 text-xs mt-2">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-gold/10 text-accent-gold border border-accent-gold/20 hover:bg-accent-gold/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-accent-gold/30 border-t-accent-gold rounded-full animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Generate
            </>
          )}
        </button>
      </div>
    </div>
  )
}
