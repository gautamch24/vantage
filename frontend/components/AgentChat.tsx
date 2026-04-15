'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, ChevronDown, ChevronUp, Wrench, AlertCircle } from 'lucide-react'
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
  'What are the biggest concentration risks?',
  'Compare performance across all scenarios',
  'What was the worst single day during COVID?',
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

    const userMsg: Message = { role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMsg])
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
        {
          role: 'assistant',
          content: response.content,
          toolCalls: response.toolCallsMade,
        },
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

  const portfolioLabel = holdings.map((h) => `${h.weight}% ${h.ticker}`).join(', ')

  return (
    <div className="flex flex-col h-full min-h-[520px]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(99,132,184,0.12)]">
        <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-gold" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">VANTAGE AI Analyst</p>
          <p className="text-xs text-slate-500 truncate max-w-xs">{portfolioLabel || 'No holdings'}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="pulse-dot" />
          <span className="text-xs text-slate-500">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="py-6">
            <p className="text-slate-500 text-sm text-center mb-4">
              Ask me anything about this portfolio and historical stress scenarios.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs px-3 py-2.5 rounded-lg glass border border-[rgba(99,132,184,0.12)] text-slate-400 hover:text-slate-200 hover:border-[rgba(99,132,184,0.25)] transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
            {/* Avatar */}
            <div
              className={cn(
                'w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5',
                msg.role === 'user'
                  ? 'bg-blue-500/20 border border-blue-500/30'
                  : 'bg-gold/10 border border-gold/20',
              )}
            >
              {msg.role === 'user' ? (
                <User className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-gold" />
              )}
            </div>

            <div className={cn('flex flex-col gap-1.5 max-w-[85%]', msg.role === 'user' && 'items-end')}>
              {/* Tool calls badge */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <ToolCallBadges toolCalls={msg.toolCalls} />
              )}

              {/* Bubble */}
              <div
                className={cn(
                  'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-blue-600/20 border border-blue-500/20 text-slate-200 rounded-tr-sm'
                    : 'glass border border-[rgba(99,132,184,0.12)] text-slate-300 rounded-tl-sm',
                )}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5 bg-gold/10 border border-gold/20">
              <Bot className="w-3.5 h-3.5 text-gold" />
            </div>
            <div className="glass border border-[rgba(99,132,184,0.12)] px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex items-center gap-1.5">
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2 border border-red-400/20">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-[rgba(99,132,184,0.12)]">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about risk metrics, compare scenarios, get analysis..."
            rows={1}
            className="flex-1 resize-none bg-bg-elevated border border-[rgba(99,132,184,0.15)] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/10 transition-all leading-snug"
            style={{ maxHeight: '120px' }}
            onInput={(e) => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl bg-gold text-bg disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2">Press Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  )
}

function ToolCallBadges({ toolCalls }: { toolCalls: ToolCallRecord[] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="text-left">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-400 transition-colors"
      >
        <Wrench className="w-3 h-3" />
        <span>{toolCalls.length} tool call{toolCalls.length !== 1 ? 's' : ''}</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-1">
          {toolCalls.map((tc, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-gold/5 border border-gold/10 text-slate-400"
            >
              <span className="font-mono text-gold/70">{tc.tool}</span>
              <span className="text-slate-600">—</span>
              <span>{tc.summary}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
