export interface Holding {
  ticker: string
  weight: number
}

export interface Scenario {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  crisisSummary: string
}

export interface MetricsDto {
  maxDrawdown: number
  worstSingleDay: number
  recoveryDays: number | null
  sharpeRatio: number
  annualizedVolatility: number
  beta: number
}

export interface TimeseriesPoint {
  date: string
  value: number
}

export interface HoldingBreakdown {
  ticker: string
  drawdown: number
  weight: number
}

export interface SimulateResponse {
  metrics: MetricsDto
  timeseries: TimeseriesPoint[]
  holdingsBreakdown: HoldingBreakdown[]
}

export interface SimulateRequest {
  holdings: Holding[]
  scenarioId: string
}

export interface NarrativeRequest {
  portfolioSummary: string
  scenarioId: string
  metrics: MetricsDto
}
