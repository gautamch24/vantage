# Vantage — Portfolio Stress Testing Simulator

A full-stack web application that simulates how a user-defined stock portfolio would have performed during historical market crises. Built to demonstrate AWM-relevant engineering: risk management, portfolio analysis, agentic AI, and production-grade full-stack development.

**The core question:** "What would happen to my portfolio if 2008 happened again?"

---

## Features

**Portfolio Builder**
Define holdings by ticker and weight percentage. Weights must sum to 100%. Preset portfolios available: Tech-Heavy, Balanced 60/40, Financial Heavy, Diversified.

**Scenario Selector**
Five historical stress scenarios seeded from real market data:
- 2008 Financial Crisis (Oct 2007 – Mar 2009)
- COVID Crash (Feb 2020 – Apr 2020)
- Dot-com Bubble (Mar 2000 – Oct 2002)
- 2022 Rate Shock (Jan 2022 – Oct 2022)
- Black Monday 1987 (Oct 1987)

**Simulation Engine**
Fetches real daily adjusted close prices from Yahoo Finance. Normalizes all prices to 100 on day 0, applies portfolio weights, and computes six risk metrics:
- Max Drawdown — peak-to-trough percentage decline
- Worst Single Day — minimum daily return during the period
- Recovery Days — calendar days until portfolio returns to pre-crisis value
- Annualized Volatility — std deviation of daily returns scaled by sqrt(252)
- Sharpe Ratio — annualized risk-adjusted return vs a 5% risk-free rate
- Beta vs S&P 500 — covariance(portfolio, SPY) / variance(SPY)

**Results Dashboard**
Recharts line chart of normalized portfolio value, six metric cards, and a per-holding drawdown breakdown table.

**AI Narrative**
One-shot Claude Sonnet 4.6 prompt that explains what caused the crisis, why specific holdings were hit, and what the metrics mean in practical terms.

**Agentic AI Analyst**
A multi-turn Claude agent that can autonomously call tools before answering natural language questions. The agent never guesses numbers — it always runs real simulations first.

Available tools:
- `list_scenarios` — returns all available stress scenarios
- `run_simulation` — runs a full stress test against a specific scenario
- `compare_all_scenarios` — runs the portfolio through all 5 scenarios and returns results ranked by max drawdown

The agent loop runs up to 8 iterations. Every response includes a tool call trace so the user can see exactly what the agent computed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, Recharts, Axios |
| Backend | Kotlin, Spring Boot 3.5, Spring Data JPA, Hibernate, Gradle, JDK 17 |
| Data Service | Python 3.11, FastAPI, curl_cffi (Chrome TLS fingerprinting), Redis |
| Databases | PostgreSQL (portfolios, scenarios, results), Redis (price cache, 24hr TTL) |
| AI | Claude Sonnet 4.6 via direct Anthropic API — one-shot narrative + agentic tool use |
| Infrastructure | Docker Compose (local), Vercel (frontend), Railway (backend + data service) |

---

## Architecture

```
Next.js Frontend
    |
    | REST (Axios)
    v
Spring Boot Backend (Kotlin)
    POST /api/portfolios
    GET  /api/scenarios
    POST /api/simulate
    POST /api/narratives
    POST /api/agent/chat     <-- agentic multi-turn loop
    |                   \
    | HTTP                \
    v                      v
Python Data Service      Anthropic API
  FastAPI                  (claude-sonnet-4-6)
  curl_cffi
  Redis cache
    |
    v
Yahoo Finance v8 API
  (direct HTTP, adjusted close prices)
```

The Python data service calls Yahoo Finance v8 directly using `curl_cffi` to impersonate a Chrome browser TLS fingerprint, bypassing bot detection. It caches responses in Redis with a 24-hour TTL and gracefully degrades if Redis is unavailable.

The agentic loop in `AgentService.kt` follows the Anthropic tool use pattern: send tools + messages, receive `tool_use` blocks, execute them (calling `SimulationService` with real data), append `tool_result` blocks, repeat until `end_turn`. Agent simulations use transient in-memory portfolios and do not persist to PostgreSQL.

---

## Running Locally

### Prerequisites
- Docker and Docker Compose
- JDK 17+
- Python 3.11+
- Node.js 20+
- An Anthropic API key

### 1. Start databases

```bash
docker compose up -d
```

This starts PostgreSQL on port 5432 and Redis on port 6379.

### 2. Start the Python data service

```bash
cd data-service
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

### 3. Start the Spring Boot backend

Set environment variables:
```bash
export ANTHROPIC_API_KEY=your_key_here
export DATA_SERVICE_URL=http://localhost:8000
```

```bash
cd backend
./gradlew bootRun
```

The backend starts on port 8080. On first run, `ScenarioDataLoader` seeds the five historical scenarios into PostgreSQL.

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## Environment Variables

### Spring Boot (`application.yml` / environment)

| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL username |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL password |
| `SPRING_DATA_REDIS_HOST` | Redis host |
| `SPRING_DATA_REDIS_PORT` | Redis port |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `DATA_SERVICE_URL` | Base URL of the Python data service |

### Python Data Service

| Variable | Description |
|---|---|
| `REDIS_URL` | Full Redis URL (takes priority over HOST/PORT) |
| `REDIS_HOST` | Redis hostname (default: localhost) |
| `REDIS_PORT` | Redis port (default: 6379) |

### Frontend

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Spring Boot backend URL (default: http://localhost:8080) |

---

## Project Structure

```
vantage/
├── backend/                          Spring Boot (Kotlin)
│   └── src/main/kotlin/com/vantage/backend/
│       ├── config/
│       │   ├── AppConfig.kt          RestTemplate bean
│       │   ├── CorsConfig.kt
│       │   └── ScenarioDataLoader.kt Seed 5 scenarios on startup
│       ├── controller/
│       │   ├── AgentController.kt    POST /api/agent/chat
│       │   ├── NarrativeController.kt
│       │   ├── PortfolioController.kt
│       │   ├── ScenarioController.kt
│       │   └── SimulationController.kt
│       ├── dto/
│       │   └── AgentDto.kt           AgentChatRequest/Response, ToolCallRecord
│       ├── exception/
│       │   └── GlobalExceptionHandler.kt
│       ├── model/                    JPA entities (Portfolio, Holding, Scenario, SimulationResult)
│       ├── repository/               Spring Data JPA repositories
│       ├── client/
│       │   └── DataServiceClient.kt  HTTP client to Python data service
│       └── service/
│           ├── AgentService.kt       Multi-turn agentic loop, tool execution
│           ├── NarrativeService.kt   One-shot Claude narrative
│           ├── PortfolioService.kt
│           └── SimulationService.kt  Core simulation engine, 6 risk metrics
│
├── data-service/                     Python (FastAPI)
│   ├── main.py                       Yahoo Finance v8 proxy, Redis cache
│   ├── requirements.txt
│   ├── Procfile                      Railway deployment
│   └── tests/
│
├── frontend/                         Next.js 15
│   ├── app/
│   ├── components/
│   │   ├── AgentChat.tsx             Agentic chat UI with tool call trace
│   │   ├── SimulatorApp.tsx          Top-level orchestrator
│   │   ├── PortfolioBuilder.tsx
│   │   ├── ScenarioSelector.tsx
│   │   ├── ResultsDashboard.tsx
│   │   ├── MetricCards.tsx
│   │   ├── TimeseriesChart.tsx
│   │   ├── HoldingsBreakdown.tsx
│   │   └── NarrativeCard.tsx
│   ├── lib/
│   │   └── api.ts                    Typed Axios client for all endpoints
│   └── types/
│
├── docker-compose.yml                PostgreSQL + Redis
└── CLAUDE.md                         Full architecture and interview notes
```

---

## API Reference

### POST /api/simulate

Run a stress test for a portfolio against a scenario.

```json
{
  "holdings": [{ "ticker": "AAPL", "weight": 40 }, { "ticker": "JPM", "weight": 60 }],
  "scenarioId": "<uuid>"
}
```

Returns metrics, daily timeseries normalized to 100, and per-holding drawdown breakdown.

### POST /api/agent/chat

Send a natural language question to the agentic analyst. The agent will call tools (running real simulations) before responding.

```json
{
  "holdings": [{ "ticker": "AAPL", "weight": 40 }, { "ticker": "JPM", "weight": 60 }],
  "message": "Which scenario would have been worst for this portfolio?"
}
```

Returns the agent's response and a list of tool calls made, e.g.:

```json
{
  "content": "The 2008 Financial Crisis would have been most devastating at -58.3% max drawdown...",
  "toolCallsMade": [
    { "tool": "compare_all_scenarios", "summary": "Compared portfolio across all historical scenarios" }
  ]
}
```

### GET /api/scenarios

Returns all 5 available stress scenarios with name, date range, and description.

### POST /api/narratives

One-shot Claude explanation of simulation results in plain English.

---

## Key Design Decisions

**Why a separate Python data service instead of calling Yahoo Finance from Spring Boot?**
The `curl_cffi` library is Python-native and essential for impersonating a Chrome TLS fingerprint to bypass Yahoo Finance bot detection. This is not available in the JVM ecosystem. Separating it also means the data proxy can be deployed, scaled, and replaced independently of the main API.

**Why Redis for price caching?**
Historical prices for a given ticker and date range never change. Redis gives sub-millisecond read latency for cache hits and avoids repeated external API calls. The 24-hour TTL is conservative given the data is static.

**Why transient portfolios in the agent?**
The agent may run many simulations across different scenarios in a single conversation. Persisting all of these to PostgreSQL would pollute the database with ephemeral data. Transient portfolios exist only in memory for the duration of the agent's tool calls.

**Why direct HTTP to the Anthropic API instead of an SDK?**
It keeps the dependency footprint minimal and makes the request/response format explicit in the code — important for understanding and debugging the tool use loop.

---

## Deployment

**Frontend — Vercel**
Connect the `/frontend` directory. Set `NEXT_PUBLIC_API_URL` to the Railway backend URL.

**Backend + Data Service — Railway**
Deploy `/backend` as a Gradle service and `/data-service` using the `Procfile`. Set all environment variables in Railway's dashboard. PostgreSQL and Redis can be provisioned as Railway plugins.
