import { SimulatorApp } from '@/components/SimulatorApp'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Sticky nav */}
      <header className="sticky top-0 z-50 border-b border-[rgba(99,132,184,0.1)] backdrop-blur-md"
        style={{ background: 'rgba(8,13,20,0.85)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="#d4af37" strokeWidth="1.5" fill="none"/>
                <path d="M8 4L11 5.75V9.25L8 11L5 9.25V5.75L8 4Z" fill="#d4af37" opacity="0.3"/>
              </svg>
            </div>
            <div>
              <span className="text-base font-bold tracking-widest gold-text">VANTAGE</span>
              <span className="hidden sm:inline text-xs text-slate-600 ml-2 font-normal tracking-normal">
                Portfolio Stress Testing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="pulse-dot" />
            <span className="text-xs text-slate-500">Live Data · yFinance</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/5 text-xs text-gold/80 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-pulse" />
            AWM Risk Management Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 leading-tight mb-3">
            What would happen to your<br />
            portfolio if{' '}
            <span className="gold-text">2008 happened again?</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Define your holdings, select a historical stress scenario, and get real drawdown
            metrics with AI-powered risk analysis — the same workflow used by Goldman Sachs AWM analysts.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-10">
          {STATS.map((s) => (
            <div key={s.label} className="glass rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
              <p className="text-sm font-bold text-slate-200">{s.value}</p>
            </div>
          ))}
        </div>

        <SimulatorApp />
      </div>
    </div>
  )
}

const STATS = [
  { label: 'Scenarios', value: '5 Crises' },
  { label: 'Price Data', value: 'Daily OHLC' },
  { label: 'Metrics', value: '6 Risk KPIs' },
  { label: 'AI Model', value: 'Claude Sonnet' },
  { label: 'Cache', value: 'Redis TTL 24h' },
]
