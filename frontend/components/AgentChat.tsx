'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { agentChat, type ToolCallRecord } from '@/lib/api'
import type { Holding } from '@/types'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCallRecord[]
}

interface Props {
  holdings: Holding[]
}

const SUGGESTED_QUESTIONS = [
  'Which scenario would hit this portfolio hardest?',
  'How would this portfolio have survived 2008?',
  'Compare performance across all scenarios',
  'What was the worst single day during COVID?',
  'Where is the biggest concentration risk?',
]

export function AgentChat({ holdings }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await agentChat({
        holdings: holdings.map((h) => ({ ticker: h.ticker, weight: h.weight })),
        message: trimmed,
      })
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.content, toolCalls: response.toolCallsMade },
      ])
    } catch {
      setError('Agent unavailable. Ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[520px]">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>AI Analyst</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Runs live simulations before answering
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="py-4">
            <p className="text-xs text-center mb-4" style={{ color: 'var(--text-muted)' }}>
              Ask anything about this portfolio and historical stress scenarios.
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs px-3 py-2 rounded-md border transition-colors"
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
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2.5', msg.role === 'user' && 'flex-row-reverse')}>
            <div className="flex flex-col gap-1.5 max-w-[88%]" style={{ alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <ToolCallBadges toolCalls={msg.toolCalls} />
              )}
              <div
                className="px-3.5 py-2.5 rounded-lg text-sm leading-relaxed"
                style={
                  msg.role === 'user'
                    ? { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }
                    : { background: 'rgba(56,139,253,0.06)', border: '1px solid rgba(56,139,253,0.15)', color: 'var(--text-secondary)' }
                }
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div
              className="px-3.5 py-2.5 rounded-lg"
              style={{ background: 'rgba(56,139,253,0.06)', border: '1px solid rgba(56,139,253,0.15)' }}
            >
              <div className="flex items-center gap-1">
                <span className="typing-dot w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--text-muted)' }} />
                <span className="typing-dot w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--text-muted)' }} />
                <span className="typing-dot w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            className="flex items-center gap-2 text-xs rounded-md px-3 py-2 border"
            style={{ color: 'var(--red)', background: 'rgba(248,81,73,0.06)', borderColor: 'rgba(248,81,73,0.2)' }}
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about risk metrics, compare scenarios..."
            rows={1}
            className="flex-1 resize-none rounded-md px-3.5 py-2.5 text-sm focus:outline-none transition-colors leading-snug"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              maxHeight: '120px',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-bright)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
            onInput={(e) => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-md border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'var(--accent)',
              borderColor: 'var(--accent)',
              color: '#0d1117',
            }}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  )
}

function ToolCallBadges({ toolCalls }: { toolCalls: ToolCallRecord[] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
      >
        <span>{toolCalls.length} tool call{toolCalls.length !== 1 ? 's' : ''}</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {expanded && (
        <div className="mt-1 space-y-1">
          {toolCalls.map((tc, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded border"
              style={{
                background: 'rgba(227,179,65,0.04)',
                borderColor: 'rgba(227,179,65,0.15)',
                color: 'var(--text-muted)',
              }}
            >
              <span className="font-mono" style={{ color: 'var(--accent)', opacity: 0.8 }}>{tc.tool}</span>
              <span>—</span>
              <span>{tc.summary}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
