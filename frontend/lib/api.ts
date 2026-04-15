import axios from 'axios'
import type { Scenario, SimulateRequest, SimulateResponse, NarrativeRequest } from '@/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

export async function fetchScenarios(): Promise<Scenario[]> {
  const { data } = await api.get<Scenario[]>('/api/scenarios')
  return data
}

export async function runSimulation(request: SimulateRequest): Promise<SimulateResponse> {
  const { data } = await api.post<SimulateResponse>('/api/simulate', request)
  return data
}

export async function generateNarrative(request: NarrativeRequest): Promise<string> {
  const { data } = await api.post<{ narrative: string }>('/api/narratives', request)
  return data.narrative
}

export interface AgentChatRequest {
  holdings: { ticker: string; weight: number }[]
  message: string
}

export interface ToolCallRecord {
  tool: string
  summary: string
}

export interface AgentChatResponse {
  content: string
  toolCallsMade: ToolCallRecord[]
}

export async function agentChat(request: AgentChatRequest): Promise<AgentChatResponse> {
  const { data } = await api.post<AgentChatResponse>('/api/agent/chat', request)
  return data
}
