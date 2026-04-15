import { SimulatorApp } from '@/components/SimulatorApp'

export default function Home() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(6, 13, 24, 0.92)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 52 }}
          className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 15, letterSpacing: '0.08em' }}>
              VANTAGE
            </span>
            <span style={{
              color: 'var(--text-3)',
              fontSize: 12,
              paddingLeft: 12,
              borderLeft: '1px solid var(--border)',
            }}>
              Portfolio Stress Testing
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>Live · yFinance</span>
          </div>
        </div>
      </header>

      {/* Page */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Hero */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            AWM Risk Analysis
          </p>
          <h1 style={{ color: 'var(--text-1)', fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 10, maxWidth: 640 }}>
            What would happen to your portfolio<br />
            if <span style={{ color: 'var(--gold)' }}>2008 happened again?</span>
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6, maxWidth: 560, marginBottom: 20 }}>
            Define your holdings, select a historical stress scenario, and get real drawdown
            metrics with an AI analyst that runs live simulations before answering.
          </p>
          {/* Info chips */}
          <div className="flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <span key={c} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-2)',
              }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        <SimulatorApp />
      </div>
    </div>
  )
}

const CHIPS = [
  '5 Historical Scenarios',
  '6 Risk Metrics',
  'Daily Adjusted Prices',
  'Claude Sonnet 4.6',
  'Redis Cache',
]
