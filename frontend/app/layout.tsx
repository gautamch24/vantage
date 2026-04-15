import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vantage — Portfolio Stress Testing',
  description:
    'Simulate how your portfolio would have performed during historical market crises. Built for wealth management professionals.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: '#080d14' }}>
      <body className="min-h-screen text-slate-100">{children}</body>
    </html>
  )
}
