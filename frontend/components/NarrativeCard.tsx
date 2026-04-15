'use client'

import { useState } from 'react'
import { generateNarrative } from '@/lib/api'
import type { MetricsDto, Holding } from '@/types'
import { ChevronDown, ChevronUp } from 'lucide-react'

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

  const portfolioSummary = holdings.map((h) => `${Number(h.weight).toFixed(0)}% ${h.ticker}`).join(', ')

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const text = await generateNarrative({ portfolioSummary, scenarioId, metrics })
      setNarrative(text)
    } catch {
      setError('Failed to generate. Check ANTHROPIC_API_KEY is configured.')
    } finally {
      setLoading(false)
    }
  }

  if (narrative) {
    return (
      <div className="panel" style={{ padding: '20px 24px', borderColor: 'rgba(212,175,55,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>AI Narrative</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{scenarioName}</span>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)' }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        {expanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {narrative.split('\n\n').map((para, i) => (
              <p key={i} style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>{para}</p>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="panel" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>AI Narrative</p>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
            Plain-English explanation of what happened, why your holdings were hit, and what it means for your risk profile.
          </p>
          {error && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{error}</p>}
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer', flexShrink: 0,
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)',
            color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 8,
            opacity: loading ? 0.6 : 1, transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(212,175,55,0.18)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)' }}
        >
          {loading ? (
            <>
              <span style={{
                width: 13, height: 13, borderRadius: '50%',
                border: '2px solid rgba(212,175,55,0.3)', borderTopColor: 'var(--gold)',
                display: 'inline-block', animation: 'spin 0.7s linear infinite',
              }} />
              Generating...
            </>
          ) : 'Generate'}
        </button>
      </div>
    </div>
  )
}
