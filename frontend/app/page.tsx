import { SimulatorApp } from '@/components/SimulatorApp'

export default function Home() {
  return (
    <main className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-surface-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-accent-gold">
              VANTAGE
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Portfolio Stress Testing Simulator</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
            Live Market Data via yFinance
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-100 mb-2">
            What would happen to your portfolio if{' '}
            <span className="text-accent-gold">2008 happened again?</span>
          </h2>
          <p className="text-slate-400 max-w-2xl">
            Input your holdings, select a historical stress scenario, and see exactly how your
            portfolio would have performed — with real price data and AI-powered analysis.
          </p>
        </div>

        <SimulatorApp />
      </div>
    </main>
  )
}
