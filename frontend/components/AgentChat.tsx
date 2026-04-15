'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, ChevronDown, ChevronUp } from 'lucide-react'
import { agentChat, type ToolCallRecord } from '@/lib/api'
import type { Holding } from '@/types'

interface Message { role: 'user' | 'assistant'; content: string; toolCalls?: ToolCallRecord[] }
interface Props { holdings: Holding[] }

const SUGGESTIONS = [
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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function send(text: string) {
    const t = text.trim()
    if (!t || loading) return
    setMessages((p) => [...p, { role: 'user', content: t }])
    setInput('')
    setLoading(true)
    setError(null)
    try {
      const r = await agentChat({ holdings: holdings.map((h) => ({ ticker: h.ticker, weight: h.weight })), message: t })
      setMessages((p) => [...p, { role: 'assistant', content: r.content, toolCalls: r.toolCallsMade }])
    } catch { setError('Agent unavailable. Ensure the backend is running.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 520 }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>AI Analyst</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Runs live simulations before answering</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Active</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.length === 0 && !loading && (
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginBottom: 14 }}>
              Ask anything about this portfolio and historical stress scenarios.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} style={{
                  textAlign: 'left', fontSize: 12, padding: '8px 12px',
                  borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)', color: 'var(--text-2)',
                  cursor: 'pointer', transition: 'all 0.12s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.borderColor = 'var(--border-hover)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 6 }}>
            {msg.toolCalls && msg.toolCalls.length > 0 && <ToolBadges toolCalls={msg.toolCalls} />}
            <div style={{
              maxWidth: '88%', padding: '10px 14px', borderRadius: 10, fontSize: 13, lineHeight: 1.65,
              ...(msg.role === 'user'
                ? { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-1)' }
                : { background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.15)', color: 'var(--text-2)' }),
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex' }}>
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.15)', display: 'flex', gap: 4, alignItems: 'center' }}>
              <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', display: 'inline-block' }} />
              <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', display: 'inline-block' }} />
              <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', display: 'inline-block' }} />
            </div>
          </div>
        )}

        {error && (
          <p style={{ fontSize: 12, color: 'var(--red)', padding: '8px 12px', borderRadius: 8, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)' }}>
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
            placeholder="Ask about risk metrics, compare scenarios..."
            rows={1}
            className="field flex-1"
            style={{ padding: '9px 12px', resize: 'none', maxHeight: 120, lineHeight: 1.5 }}
            onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px' }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            style={{
              width: 38, height: 38, borderRadius: 8, border: 'none',
              background: input.trim() && !loading ? 'var(--gold)' : 'var(--bg-elevated)',
              color: input.trim() && !loading ? '#060d18' : 'var(--text-3)',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            <Send size={14} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  )
}

function ToolBadges({ toolCalls }: { toolCalls: ToolCallRecord[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} style={{
        display: 'flex', alignItems: 'center', gap: 5, fontSize: 11,
        color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-2)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)' }}
      >
        {toolCalls.length} tool call{toolCalls.length !== 1 ? 's' : ''}
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
      {open && (
        <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {toolCalls.map((tc, i) => (
            <div key={i} style={{
              fontSize: 11, padding: '5px 10px', borderRadius: 6,
              background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)',
              display: 'flex', gap: 6, color: 'var(--text-3)',
            }}>
              <span style={{ fontFamily: 'monospace', color: 'var(--gold)', opacity: 0.8 }}>{tc.tool}</span>
              <span>—</span>
              <span>{tc.summary}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
