import { SimulatorApp } from '@/components/SimulatorApp'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>VANTAGE</span>
            <span className="hidden sm:inline text-xs" style={{ color: 'var(--text-muted)' }}>
              Portfolio Stress Testing
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Live · yFinance</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-16">
        {/* Page header */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            AWM Risk Analysis
          </p>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            What would happen to your portfolio if 2008 happened again?
          </h1>
          <p className="text-sm max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Define your holdings, select a historical stress scenario, and get real drawdown metrics with
            an AI analyst that runs live simulations before answering.
          </p>
        </div>

        <SimulatorApp />
      </div>
    </div>
  )
}
