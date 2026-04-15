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
      setError('Failed to generate. Check that ANTHROPIC_API_KEY is configured.')
    } finally {
      setLoading(false)
    }
  }

  if (narrative) {
    return (
      <div
        className="rounded-2xl border p-5"
        style={{ background: 'rgba(212,175,55,0.04)', borderColor: 'rgba(212,175,55,0.15)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm font-semibold text-slate-200">AI Narrative</span>
            <span className="text-xs text-slate-500 hidden sm:inline">— {scenarioName}</span>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-slate-600 hover:text-slate-400 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {expanded && (
          <div className="space-y-3">
            {narrative.split('\n\n').map((para, i) => (
              <p key={i} className="text-slate-400 leading-relaxed text-sm">
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl border border-[rgba(99,132,184,0.12)] p-5">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm font-semibold text-slate-200">AI Narrative</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Plain-English explanation of what happened, why your portfolio was hit, and what it means
            for your risk profile — from a Goldman Sachs AWM analyst perspective.
          </p>
          {error && (
            <div className="flex items-center gap-1.5 text-red-400 text-xs mt-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold/20 bg-gold/8 text-gold hover:bg-gold/15 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
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
