# CLAUDE.md — Portfolio Stress Testing Simulator

> Built to demonstrate AWM-relevant engineering: risk management, portfolio analysis, full-stack development, and agentic AI — aligned with Goldman Sachs AWM SWE requirements.

---

## Project Overview

A full-stack web application that simulates how a user-defined portfolio of stocks would have performed during historical market stress events (2008 Financial Crisis, COVID Crash, etc.). The app pulls real historical price data from Yahoo Finance, runs drawdown calculations, visualizes the portfolio's behavior through the crisis, uses Claude AI to generate a plain-English narrative explaining what happened and why, and provides an **agentic AI analyst** that can autonomously run simulations and compare scenarios in response to natural language questions.

**The one-line pitch:** "What would happen to my portfolio if 2008 happened again tomorrow?"

---

## Why This Maps to the Goldman Sachs AWM JD

| JD Requirement | How This Project Covers It |
|---|---|
| Portfolio management functions | Core feature — user inputs and manages a portfolio |
| Risk management functions | Stress testing IS risk management |
| Capital management functions | Max drawdown = how much capital is at risk |
| Full-stack development | React frontend + Spring Boot backend + PostgreSQL |
| TypeScript + ReactJS | Entire frontend in Next.js 15 + TypeScript |
| Python | Data service layer (Yahoo Finance microservice) |
| SpringBoot / Kotlin | Main backend API, business logic, metrics calculation |
| Relational databases | PostgreSQL for portfolios and scenarios |
| Non-relational databases | Redis for caching price API responses |
| Analytical + programming skills | Financial metric calculations (drawdown, Sharpe, beta, VaR) |
| Translate business requirements into applications | AWM workflow → working tool |
| Microservices architecture | Spring Boot service + Python data service communicating over HTTP |
| AI/agentic systems | Multi-turn Claude agent with tool use — autonomously calls simulation engine |

---

## Concepts to Learn While Building (Goldman Vocabulary)

Before building each section, understand these terms — you will be asked about them in interviews:

### Risk Management Concepts
- **Drawdown** — The percentage drop from a portfolio's peak value to its lowest point during a period. Max drawdown is the worst single drop. Formula: `(trough - peak) / peak`
- **Value at Risk (VaR)** — The maximum expected loss over a given period at a given confidence level. Example: "95% VaR of $10,000 means there's a 5% chance of losing more than $10k in a day."
- **Sharpe Ratio** — Return divided by volatility. Measures how much return you're getting per unit of risk. Higher is better. Formula: `(portfolio_return - risk_free_rate) / std_deviation`. We annualize using `sqrt(252)` (trading days per year).
- **Volatility** — Standard deviation of daily returns. Higher volatility = more unpredictable = riskier.
- **Beta** — How much your portfolio moves relative to the market (S&P 500 via SPY). Formula: `covariance(portfolio_returns, market_returns) / variance(market_returns)`. Beta of 1.5 means if the market drops 10%, your portfolio drops 15%.
- **Recovery Time** — How long it takes a portfolio to return to its pre-crisis peak value.

### AWM Domain Concepts
- **Stress Testing** — Simulating how a portfolio performs under extreme but historically observed market conditions.
- **Scenario Analysis** — Running a portfolio through specific hypothetical or historical events to understand risk exposure.
- **Concentration Risk** — When too much of a portfolio is in one ticker, sector, or asset class. Makes stress events more dangerous.
- **Correlation** — How assets move relative to each other. During a crisis, correlations spike — assets that normally move independently start falling together.
- **Diversification** — Spreading assets to reduce concentration risk. The stress test will expose whether a portfolio is truly diversified.

### Tech Concepts (JD-Specific)
- **SpringBoot / Kotlin** — What Goldman actually uses on the backend. We ARE using Spring Boot + Kotlin for the main backend. Spring Boot is a Java/Kotlin framework for building production REST APIs. Key annotations: `@RestController`, `@Service`, `@Repository`, `@GetMapping`/`@PostMapping`. Kotlin is Goldman's preferred JVM language — more concise than Java, null-safe, interoperable.
- **ORM** — Object-relational mapping. We use Spring Data JPA with Hibernate (the industry standard). Same concept as SQLAlchemy in Python — you define entity classes and the ORM handles SQL.
- **Microservices** — The Spring Boot service (main API, metrics, DB) and the Python data service (Yahoo Finance proxy) are separate deployable units that communicate over HTTP. This is how Goldman's systems are structured. The Spring Boot service calls the Python service's `/data/prices` endpoint to get historical prices.
- **Caching** — The Python data service caches Yahoo Finance responses in Redis so we don't re-fetch historical data on every request. Same pattern Goldman uses for market data feeds.
- **Agentic AI / Tool Use** — The Claude agent operates in a multi-turn loop: receives a user question, decides which tools to call (list_scenarios, run_simulation, compare_all_scenarios), executes them against real data, and synthesizes a quantitative answer. This is the `tool_use` / `end_turn` loop pattern in the Anthropic API. The agent never guesses numbers — it always calls tools first.
- **Unit Testing** — Spring Boot: use JUnit 5 + MockK (Kotlin mock library). Python data service: use pytest.
- **Integration Testing** — Spring Boot: use `@SpringBootTest` + `MockMvc` to test controllers end-to-end. Test that `POST /api/simulate` returns correct data given a known portfolio.

---

## User

**Primary User:** A wealth management analyst or portfolio manager who wants to quickly assess how a client's portfolio would hold up under various market stress scenarios without running a Bloomberg terminal query.

**Secondary User (demo context):** A hiring manager or interviewer evaluating whether a candidate understands what AWM engineers build.

---

## User Stories

### Core
1. As a user, I want to input a set of stock tickers and their portfolio weights so I can define my portfolio.
2. As a user, I want to select a historical stress scenario so I can see how my portfolio would have performed during that crisis.
3. As a user, I want to see a line chart of my portfolio value over the crisis period so I can visualize the damage and recovery.
4. As a user, I want to see key risk metrics (max drawdown, worst day, recovery time, Sharpe ratio) so I can quantify the risk numerically.
5. As a user, I want Claude to explain what happened in plain English so I can understand the narrative behind the numbers.
6. As a user, I want to ask the AI analyst natural language questions and have it autonomously run simulations and cite real figures.

### Secondary
7. As a user, I want to compare two portfolios side-by-side under the same scenario so I can evaluate diversification tradeoffs.
8. As a user, I want to save a portfolio so I can re-run different scenarios without re-entering tickers.
9. As a user, I want to see which individual holdings were hit hardest so I can identify concentration risk.

### Stretch
10. As a user, I want to run a custom date-range scenario (not just presets) so I can test against any market period.
11. As a user, I want to export the results as a PDF report.

---

## Features

### Feature 1: Portfolio Builder — COMPLETE
- Ticker input with weight assignment (must sum to 100%)
- Real-time weight validation with live error messaging
- Preset portfolios for demo purposes: Tech-Heavy, Balanced 60/40, Financial Heavy, Diversified
- Portfolio state managed in React with full validation before simulation runs

### Feature 2: Scenario Selector — COMPLETE
Preloaded historical stress scenarios seeded into PostgreSQL on startup (`ScenarioDataLoader.kt`):

| Scenario | Date Range | What Happened |
|---|---|---|
| 2008 Financial Crisis | Oct 2007 – Mar 2009 | Housing collapse, Lehman bankruptcy, credit freeze |
| COVID Crash | Feb 2020 – Apr 2020 | Global pandemic, fastest 30% drop in market history |
| Dot-com Bubble | Mar 2000 – Oct 2002 | Tech valuation collapse, NASDAQ dropped 78% |
| 2022 Rate Shock | Jan 2022 – Oct 2022 | Fed rate hikes crushed growth stocks and bonds |
| Black Monday 1987 | Oct 1987 | Single-day 22% market drop |

### Feature 3: Simulation Engine (Backend Core) — COMPLETE
- Fetch historical OHLC data for each ticker + SPY (S&P 500 benchmark) via Python data service
- Find common trading dates across all tickers (intersect date sets)
- Normalize prices to 100 on day 0 using adjusted close prices (accounts for splits and dividends)
- Apply portfolio weights to compute blended portfolio value per day
- Calculate metrics:
  - Max Drawdown — `(trough - peak) / peak`, iterating forward to track rolling peak
  - Worst Single Day — minimum of daily return series
  - Recovery Time — calendar days from scenario start until portfolio returns to 100
  - Annualized Volatility — `std_dev(daily_returns) * sqrt(252)`
  - Sharpe Ratio — `(mean_daily_return - risk_free_rate_daily) / std_dev * sqrt(252)`, risk-free rate ~5%/252
  - Beta vs S&P 500 — `covariance(portfolio_returns, spy_returns) / variance(spy_returns)`
- Per-holding breakdown: individual max drawdown for each ticker
- Persist SimulationResult to PostgreSQL for saved portfolios (skips persistence for transient/agent portfolios)

### Feature 4: Results Dashboard — COMPLETE
- **Line chart** — Portfolio value over crisis period (normalized to 100 starting value), built with Recharts
- **Metric cards** — Max drawdown, worst day, recovery time, Sharpe ratio, volatility, beta
- **Holdings breakdown table** — Each ticker's individual drawdown and weight during the scenario
- **AI narrative** — One-shot Claude explanation of what happened and why (NarrativeService)

### Feature 5: Claude AI Narrative — COMPLETE
One-shot prompt sent to Claude Sonnet 4.6 with the portfolio composition, scenario context, and all computed metrics. Returns a 3-4 paragraph plain-English explanation covering:
- What caused this crisis
- Why specific holdings in the portfolio were hit hard
- What the max drawdown and recovery time mean in practical terms
- What this tells us about the portfolio's risk profile

Implemented as direct HTTP POST to `https://api.anthropic.com/v1/messages` in `NarrativeService.kt` — no SDK dependency.

### Feature 6: Agentic AI Analyst — COMPLETE

The centerpiece feature that goes beyond a one-shot narrative. An embedded AI agent (`AgentService.kt`) that operates in a multi-turn reasoning loop, autonomously deciding which tools to call before answering.

**How it works:**
1. User asks a natural language question in the `AgentChat` UI (e.g., "Which scenario would destroy this portfolio the most?")
2. The Spring Boot backend sends the question + portfolio context to Claude Sonnet 4.6 with a set of tool definitions
3. Claude decides which tools to call and returns a `tool_use` stop reason
4. The backend executes the tool (which may call the full simulation engine), then feeds results back to Claude
5. Claude reasons over the tool outputs and either calls more tools or returns a final `end_turn` response with specific figures cited
6. The loop runs up to 8 iterations to handle multi-step reasoning chains
7. The frontend displays the response alongside a collapsible **tool call trace** showing which tools were invoked

**Available Tools (defined in `AgentService.buildTools()`):**

| Tool | Description | When Claude Uses It |
|---|---|---|
| `list_scenarios` | Returns all 5 historical scenarios with names, date ranges, descriptions | When the user asks what scenarios are available |
| `run_simulation` | Runs a full stress test for the current portfolio (or an override portfolio) against a specific scenario. Returns max drawdown, worst day, recovery days, Sharpe, beta, volatility, per-holding breakdown | When the user asks about a specific scenario or wants specific numbers |
| `compare_all_scenarios` | Runs the portfolio through ALL 5 scenarios and returns results ranked by max drawdown | When the user asks "which scenario is worst" or wants a comparison |

**Key Design Decisions:**
- The agent is instructed to **never guess numbers** — it must call tools before responding. This mirrors how a Goldman quant analyst would always pull real data before briefing a PM.
- `run_simulation` supports `override_holdings` — Claude can compare hypothetical portfolios mid-conversation without the user re-entering data.
- Transient portfolios (created by the agent) bypass PostgreSQL persistence — the agent doesn't pollute the DB with ephemeral simulation runs.
- Tool call records are returned in `AgentChatResponse.toolCallsMade` and rendered in the frontend as expandable badges, giving full transparency into the agent's reasoning process.

**System prompt persona:** VANTAGE AI — a Goldman Sachs-style quant analyst persona. Concise, quantitative, always cites specific figures.

**API:**
```
POST /api/agent/chat
```

**Request:**
```json
{
  "holdings": [
    { "ticker": "AAPL", "weight": 40 },
    { "ticker": "JPM", "weight": 40 },
    { "ticker": "BND", "weight": 20 }
  ],
  "message": "Which historical scenario would have been most devastating for this portfolio?"
}
```

**Response:**
```json
{
  "content": "The 2008 Financial Crisis would have been the most devastating scenario for this portfolio, with a max drawdown of -58.3%...",
  "toolCallsMade": [
    { "tool": "compare_all_scenarios", "summary": "Compared portfolio across all historical scenarios" }
  ]
}
```

**Suggested questions surfaced in the UI:**
- "Which scenario would hit this portfolio hardest?"
- "How would this portfolio have survived 2008?"
- "What are the biggest concentration risks?"
- "Compare performance across all scenarios"
- "What was the worst single day during COVID?"

---

## Tech Stack

### Frontend
```
Next.js 15 (App Router)
TypeScript
Tailwind CSS
Recharts — line charts, drawdown visualization
Lucide React — icons
Axios — API calls
```

**Components:**
- `SimulatorApp.tsx` — top-level orchestrator, manages portfolio/scenario/results state
- `PortfolioBuilder.tsx` — ticker + weight inputs, live validation
- `ScenarioSelector.tsx` — scenario grid with descriptions
- `ResultsDashboard.tsx` — post-simulation view
- `MetricCards.tsx` — 6 risk KPI cards
- `TimeseriesChart.tsx` — Recharts normalized value chart
- `HoldingsBreakdown.tsx` — per-ticker drawdown table
- `NarrativeCard.tsx` — Claude one-shot narrative display
- `AgentChat.tsx` — full agentic chat interface with tool call transparency

**Why this for Goldman:** TypeScript + ReactJS are explicitly in the JD. Next.js 15 App Router with `'use client'` on interactive components only.

### Backend — Spring Boot Service (Main API)
```
Kotlin
Spring Boot 3.5.0
Spring Web — REST controllers
Spring Data JPA + Hibernate — ORM for PostgreSQL
PostgreSQL driver
Spring Cache + Redis — caching layer
JUnit 5 + MockK — unit and integration tests
Gradle — build tool
JDK 17
```

**Controllers:**
- `PortfolioController.kt` — `POST /api/portfolios`, `GET /api/portfolios/{id}`
- `ScenarioController.kt` — `GET /api/scenarios`
- `SimulationController.kt` — `POST /api/simulate`
- `NarrativeController.kt` — `POST /api/narratives`
- `AgentController.kt` — `POST /api/agent/chat`

**Why this for Goldman:** This is exactly the stack Goldman uses. Controllers → Services → Repositories is the Spring pattern. Kotlin is Goldman's preferred JVM language over Java.

### Backend — Python Data Service (Yahoo Finance Microservice)
```
Python 3.11
FastAPI — lightweight REST API
curl_cffi — Chrome TLS fingerprint impersonation (bypasses Yahoo Finance bot detection)
redis-py — cache price API responses
pytest — tests
```

**Role:** Purely a data proxy. The Spring Boot service calls `GET /data/prices?ticker=AAPL&start=...&end=...` and gets back JSON price data. No business logic lives here.

**Important implementation detail:** The data service does **not** use the `yfinance` Python library. Instead, it calls the Yahoo Finance v8 chart API directly (`/v8/finance/chart/{ticker}`) using `curl_cffi`, which impersonates a Chrome browser TLS fingerprint to bypass Yahoo's bot detection and rate limiting. It also falls back from `query1.finance.yahoo.com` to `query2.finance.yahoo.com` on 429s. Uses adjusted close prices (`adjclose`) to account for splits and dividends.

**Endpoints:**
- `GET /data/prices?ticker=AAPL&start=2007-10-01&end=2009-03-31` — returns daily OHLC for the ticker+range
- `GET /data/validate?ticker=AAPL&start=...&end=...` — checks if ticker exists and traded during the period
- `GET /health` — returns Redis connectivity status

### Databases
```
PostgreSQL — portfolios, saved scenarios, simulation results (relational)
Redis — Yahoo Finance API response cache, 24hr TTL (non-relational)
```

**Why both:** Directly mirrors the JD's "relational and non-relational databases" requirement. PostgreSQL stores structured domain data with foreign key relationships. Redis is a key-value store used purely for read-through caching of expensive external API calls — a pattern Goldman uses for market data feeds.

### AI
```
Claude Sonnet 4.6 (claude-sonnet-4-6)
- NarrativeService: one-shot prompt for post-simulation plain-English explanation
- AgentService: multi-turn agentic loop with tool use (list_scenarios, run_simulation, compare_all_scenarios)
```

Direct HTTP integration to `https://api.anthropic.com/v1/messages` in both services — no SDK dependency, giving full visibility into the request/response format.

### Infrastructure
```
Docker Compose — run Postgres + Redis locally
Vercel — frontend deployment
Railway — Spring Boot + Python data service deployment
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Next.js Frontend                         │
│                                                               │
│  PortfolioBuilder → ScenarioSelector → [Run Stress Test]      │
│                          ↓                                    │
│             ResultsDashboard (metrics, chart, narrative)      │
│                                                               │
│  AgentChat ─────────────────────────────────────────────────► │
│  (natural language questions, tool call trace display)        │
└──────────────────────────┬────────────────────────────────────┘
                           │ REST API (Axios)
┌──────────────────────────▼────────────────────────────────────┐
│                Spring Boot Backend (Kotlin)                    │
│                                                               │
│  POST /api/portfolios     — save/retrieve portfolio           │
│  GET  /api/scenarios      — list 5 stress scenarios           │
│  POST /api/simulate       — run stress test                   │
│  POST /api/narratives     — one-shot Claude explanation       │
│  POST /api/agent/chat     — agentic multi-turn analysis       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │ Simulation   │  │  Narrative   │  │  Agent Service    │   │
│  │ Service      │  │  Service     │  │                   │   │
│  │              │  │              │  │  Multi-turn loop  │   │
│  │ - call data  │  │ - one-shot   │  │  (up to 8 iters)  │   │
│  │   service    │  │   prompt     │  │                   │   │
│  │ - intersect  │  │ - POST to    │  │  Tools:           │   │
│  │   dates      │  │   Anthropic  │  │  · list_scenarios │   │
│  │ - normalize  │  │   API        │  │  · run_simulation │   │
│  │ - calc 6     │  │              │  │  · compare_all    │   │
│  │   metrics    │  └──────────────┘  │                   │   │
│  │ - persist    │                    │  Calls Simulation │   │
│  │   to DB      │                    │  Service directly │   │
│  └──────┬───────┘                    └────────┬──────────┘   │
│         │                                     │               │
│  ┌──────▼───────────────────────────────────► │              │
│  │  PostgreSQL (Spring Data JPA / Hibernate)   │              │
│  │  portfolios, holdings, scenarios,           │              │
│  │  simulation_results                         │              │
│  └─────────────────────────────────────────────┘             │
└──────────────────────────┬────────────────────────────────────┘
                           │ HTTP (RestTemplate)
┌──────────────────────────▼────────────────────────────────────┐
│                Python Data Service (FastAPI)                   │
│                                                               │
│  GET /data/prices   — fetch adjusted daily close prices       │
│  GET /data/validate — check ticker exists and has data        │
│  GET /health        — Redis connectivity check                │
│                                                               │
│  curl_cffi: Chrome TLS impersonation → bypasses bot detect    │
│  Fallback: query1 → query2 on 429                             │
│  Uses adjclose (split + dividend adjusted)                    │
│                                                               │
│  ┌──────────────────────────────────┐                        │
│  │  Redis Cache (24hr TTL)          │                        │
│  │  Key: yfinance:{ticker}:{s}:{e}  │                        │
│  │  Graceful degradation if down    │                        │
│  └──────────────────────────────────┘                        │
└──────────────────────────┬────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼────────────────────────────────────┐
│         Yahoo Finance v8 Chart API (direct HTTP)              │
│  /v8/finance/chart/{ticker}?interval=1d&period1=...           │
└───────────────────────────────────────────────────────────────┘
                           │ Also calls
┌──────────────────────────▼────────────────────────────────────┐
│         Anthropic API (claude-sonnet-4-6)                     │
│  /v1/messages — both NarrativeService and AgentService        │
└───────────────────────────────────────────────────────────────┘
```

---

## Agentic Loop — Deep Dive

This is the most technically sophisticated part of the project and the most important to explain in interviews.

### The Pattern (tool_use loop)

```
User message
    ↓
POST /v1/messages (system prompt + tools + messages)
    ↓
Claude responds with stop_reason = "tool_use"
    ↓
Backend executes each tool_use block (may call SimulationService)
    ↓
Append tool_result blocks to messages
    ↓
POST /v1/messages again (full conversation history)
    ↓
Claude responds with stop_reason = "end_turn"  ← final answer
    (or loops back up to 8 times for multi-step queries)
```

### Why This Is Interesting to Goldman Engineers

1. **Real data, never hallucinated** — Claude is forced to call `run_simulation` before citing any numbers. The simulation fetches real Yahoo Finance prices, runs the actual drawdown math, and returns computed figures. The agent cannot make up a number.

2. **Transient portfolio pattern** — The agent builds `Portfolio` objects in memory without persisting them to PostgreSQL. This allows rapid "what if" comparisons without polluting the database with ephemeral runs.

3. **Compare all scenarios in one turn** — `compare_all_scenarios` loops over all 5 scenarios, calls `SimulationService.simulate()` for each, sorts results by max drawdown, and returns a ranked table. Claude then narrates the results. This is equivalent to what a Bloomberg terminal batch query would do.

4. **Tool call transparency in the UI** — Every response includes `toolCallsMade: List<ToolCallRecord>`. The frontend renders these as collapsible badges so the user can see exactly which tools were called and in what order — auditability that matters in finance.

5. **Stateless agent** — The conversation history (messages list) is passed in from the client on every request. The backend is fully stateless. This is the correct architecture for a scalable financial analysis service.

---

## Database Schema

### PostgreSQL

```sql
-- Saved portfolios
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Portfolio holdings (one row per ticker per portfolio)
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  ticker VARCHAR(10) NOT NULL,
  weight DECIMAL(5,2) NOT NULL, -- e.g. 30.00 for 30%
  CHECK (weight > 0 AND weight <= 100)
);

-- Predefined stress scenarios (seeded by ScenarioDataLoader on startup)
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  crisis_summary TEXT -- passed to Claude as context
);

-- Simulation results (persisted for saved portfolios only)
CREATE TABLE simulation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id),
  scenario_id UUID REFERENCES scenarios(id),
  max_drawdown DECIMAL(8,4),
  worst_day DECIMAL(8,4),
  recovery_days INTEGER,
  sharpe_ratio DECIMAL(8,4),
  volatility DECIMAL(8,4),
  beta DECIMAL(8,4),
  computed_at TIMESTAMP DEFAULT NOW()
);
```

### Redis
```
Key pattern: yfinance:{ticker}:{start_date}:{end_date}
Value: JSON array of {date, close} objects
TTL: 86400 seconds (24 hours)
Behavior: Gracefully degrades if Redis is unavailable — service falls back to live fetch
```

---

## API Contracts

### POST /api/simulate
**Request:**
```json
{
  "holdings": [
    { "ticker": "AAPL", "weight": 40 },
    { "ticker": "JPM", "weight": 40 },
    { "ticker": "BND", "weight": 20 }
  ],
  "scenarioId": "uuid-of-2008-crisis"
}
```

**Response:**
```json
{
  "metrics": {
    "maxDrawdown": -0.4120,
    "worstSingleDay": -0.0890,
    "recoveryDays": 847,
    "sharpeRatio": -1.2300,
    "annualizedVolatility": 0.3400,
    "beta": 1.1800
  },
  "timeseries": [
    { "date": "2007-10-01", "value": 100.0000 },
    { "date": "2007-10-02", "value": 99.3000 }
  ],
  "holdingsBreakdown": [
    { "ticker": "AAPL", "drawdown": -0.5800, "weight": 40 },
    { "ticker": "JPM", "drawdown": -0.7100, "weight": 40 },
    { "ticker": "BND", "drawdown": -0.0400, "weight": 20 }
  ]
}
```

### POST /api/narratives
**Request:**
```json
{
  "portfolioSummary": "40% AAPL, 40% JPM, 20% BND",
  "scenarioName": "2008 Financial Crisis",
  "crisisSummary": "Housing collapse, Lehman bankruptcy, credit freeze...",
  "metrics": { "maxDrawdown": -0.4120, "recoveryDays": 847, ... }
}
```

**Response:**
```json
{
  "narrative": "Your portfolio would have experienced a 41.2% peak-to-trough decline during the 2008 Financial Crisis..."
}
```

### POST /api/agent/chat
**Request:**
```json
{
  "holdings": [
    { "ticker": "AAPL", "weight": 40 },
    { "ticker": "JPM", "weight": 40 },
    { "ticker": "BND", "weight": 20 }
  ],
  "message": "Which historical scenario would have been most devastating for this portfolio?"
}
```

**Response:**
```json
{
  "content": "The 2008 Financial Crisis would have been the most devastating, producing a max drawdown of -58.3% with JPM leading losses at -71.0%. The Dot-com Bubble was second at -34.1%. Recovery from 2008 took 847 days — over two years. Your 20% BND position acted as a partial buffer but was insufficient given the 80% equity concentration.",
  "toolCallsMade": [
    { "tool": "compare_all_scenarios", "summary": "Compared portfolio across all historical scenarios" }
  ]
}
```

---

## Edge Cases

### Data
- **Ticker doesn't exist** — Python data service returns 404, Spring Boot propagates a 400 with the bad ticker identified, UI highlights the error
- **Ticker didn't exist during the scenario period** — e.g., a company that IPO'd after 2008. Returns 404 from data service with a descriptive message
- **Weights don't sum to 100%** — validated on frontend in real time, Run button disabled until exactly 100%
- **yFinance rate limit** — data service tries query1 first, falls back to query2 on 429

### Calculation
- **Missing price data for specific dates** — we intersect common trading dates across all tickers, so only dates where ALL tickers have data are used. No forward-fill needed.
- **Adjusted close prices** — yFinance v8 API returns `adjclose` by default, accounting for splits and dividends. We prefer `adjclose` over raw `close`.
- **Portfolio hasn't recovered by end of scenario date** — `recoveryDays` returns `null`, UI shows "Not recovered within scenario window"

### Agent
- **Agent exceeds 8 iterations** — returns a graceful fallback message without erroring
- **Simulation fails inside agent** — `executeTool` catches exceptions and returns a JSON error to Claude, which then explains the failure to the user
- **Claude API failure** — gracefully degrade: one-shot narrative shows "AI summary unavailable", agent chat shows error state

---

## Build Order

### Phase 1: Infrastructure — COMPLETE
- [x] Git repo initialized
- [x] Monorepo structure (`/frontend`, `/backend`, `/data-service`)
- [x] `docker-compose.yml` — PostgreSQL (5432) + Redis (6379) with health checks
- [x] `.gitignore`

### Phase 2: Python Data Service — COMPLETE
- [x] FastAPI project setup in `/data-service`
- [x] Yahoo Finance v8 direct price fetching (`GET /data/prices`) via curl_cffi
- [x] Ticker validation endpoint (`GET /data/validate`)
- [x] Redis caching layer (24hr TTL, graceful degradation)
- [x] Host fallback: query1 → query2 on 429
- [x] `requirements.txt`, `Procfile`, `runtime.txt` for Railway deployment
- [x] pytest tests

### Phase 3: Spring Boot Backend — COMPLETE

- [x] Project scaffold — `build.gradle.kts`, Gradle wrapper, `application.yml`
- [x] Dependencies — Spring Web, Data JPA, PostgreSQL, Redis, Cache, Validation

**Models**
- [x] `Portfolio.kt`, `Holding.kt`, `Scenario.kt`, `SimulationResult.kt`

**Repositories**
- [x] `PortfolioRepository.kt`, `ScenarioRepository.kt`, `SimulationResultRepository.kt`

**DTOs**
- [x] `SimulateRequest.kt`, `SimulateResponse.kt`, `NarrativeDto.kt`, `PortfolioDto.kt`
- [x] `AgentDto.kt` — `AgentChatRequest`, `AgentChatResponse`, `ToolCallRecord`

**Config**
- [x] `AppConfig.kt` — RestTemplate bean
- [x] `CorsConfig.kt` — allow frontend origin
- [x] `ScenarioDataLoader.kt` — seeds 5 historical crises on startup via `ApplicationRunner`

**Client**
- [x] `DataServiceClient.kt` — `getPrices()`, `validateTicker()`

**Services**
- [x] `SimulationService.kt` — full simulation engine (6 metrics, per-holding breakdown, DB persistence)
- [x] `NarrativeService.kt` — one-shot Claude prompt via direct HTTP POST to Anthropic API
- [x] `PortfolioService.kt` — portfolio CRUD with weight validation
- [x] `AgentService.kt` — multi-turn agentic loop with 3 tools, up to 8 iterations, transient portfolio support

**Controllers**
- [x] `PortfolioController.kt`
- [x] `ScenarioController.kt`
- [x] `SimulationController.kt`
- [x] `NarrativeController.kt`
- [x] `AgentController.kt` — `POST /api/agent/chat`

**Exception Handling**
- [x] `GlobalExceptionHandler.kt` — consistent error responses across all controllers

### Phase 4: Frontend — COMPLETE
- [x] Next.js 15 + TypeScript scaffold in `/frontend`
- [x] Portfolio builder form with live weight validation
- [x] Scenario selector with 5 crisis cards
- [x] Recharts line chart for timeseries (normalized to 100)
- [x] Metric cards (6 KPIs)
- [x] Holdings breakdown table
- [x] Claude narrative card
- [x] `AgentChat.tsx` — full agentic chat UI with suggested questions and tool call trace
- [x] Preset portfolios (Tech-Heavy, Balanced 60/40, Financial Heavy, Diversified)
- [x] `lib/api.ts` — typed Axios API layer for all endpoints including `/api/agent/chat`

### Phase 5: Polish + Deploy — COMPLETE
- [x] Error states and loading states on all components
- [x] Glassmorphism dark theme (Goldman-style dark financial terminal aesthetic)
- [x] Sticky nav, hero section, stats bar
- [x] Railway deployment config (Procfile, runtime.txt, env vars)
- [x] Vercel deployment for frontend

---

## Current File Structure

```
vantage/
├── backend/
│   ├── src/main/kotlin/com/vantage/backend/
│   │   ├── BackendApplication.kt
│   │   ├── client/
│   │   │   └── DataServiceClient.kt
│   │   ├── config/
│   │   │   ├── AppConfig.kt
│   │   │   ├── CorsConfig.kt
│   │   │   └── ScenarioDataLoader.kt
│   │   ├── controller/
│   │   │   ├── AgentController.kt          ← agentic endpoint
│   │   │   ├── NarrativeController.kt
│   │   │   ├── PortfolioController.kt
│   │   │   ├── ScenarioController.kt
│   │   │   └── SimulationController.kt
│   │   ├── dto/
│   │   │   ├── AgentDto.kt                 ← AgentChatRequest/Response, ToolCallRecord
│   │   │   ├── NarrativeDto.kt
│   │   │   ├── PortfolioDto.kt
│   │   │   ├── SimulateRequest.kt
│   │   │   └── SimulateResponse.kt
│   │   ├── exception/
│   │   │   └── GlobalExceptionHandler.kt
│   │   ├── model/
│   │   │   ├── Holding.kt
│   │   │   ├── Portfolio.kt
│   │   │   ├── Scenario.kt
│   │   │   └── SimulationResult.kt
│   │   ├── repository/
│   │   │   ├── PortfolioRepository.kt
│   │   │   ├── ScenarioRepository.kt
│   │   │   └── SimulationResultRepository.kt
│   │   └── service/
│   │       ├── AgentService.kt             ← multi-turn agentic loop
│   │       ├── NarrativeService.kt
│   │       ├── PortfolioService.kt
│   │       └── SimulationService.kt
│   ├── src/main/resources/
│   │   └── application.yml
│   └── build.gradle.kts
├── data-service/
│   ├── main.py                             ← FastAPI, curl_cffi, Redis cache
│   ├── requirements.txt
│   ├── Procfile
│   ├── runtime.txt
│   └── tests/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── AgentChat.tsx                   ← agentic chat UI
│   │   ├── HoldingsBreakdown.tsx
│   │   ├── MetricCards.tsx
│   │   ├── NarrativeCard.tsx
│   │   ├── PortfolioBuilder.tsx
│   │   ├── ResultsDashboard.tsx
│   │   ├── ScenarioSelector.tsx
│   │   ├── SimulatorApp.tsx
│   │   └── TimeseriesChart.tsx
│   ├── lib/
│   │   ├── api.ts                          ← typed Axios client
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── CLAUDE.md
```

---

## Interview Talking Points

When asked about this project, lead with the business problem not the tech:

> "I built a portfolio stress testing simulator for AWM risk management. The core problem is understanding how client portfolios behave under extreme market conditions. I modeled five historical crises, built a simulation engine that applies real historical price movements to user-defined portfolios, layered in two AI tiers — a one-shot narrative explainer and a full agentic analyst that can autonomously run simulations and compare scenarios in response to natural language questions — all on a Goldman-style stack of Spring Boot, Kotlin, PostgreSQL, and Redis."

Then go technical:

**On the simulation engine:**
- Walk through the drawdown calculation: rolling peak, `(trough - peak) / peak`
- Explain why you intersect dates across all tickers rather than forward-filling
- Explain adjusted close prices and why it matters (split-adjusted AAPL in 2008 vs today)
- Explain the Sharpe annualization: `sqrt(252)` scaling from daily to annual

**On the agentic layer:**
- Explain the tool_use / end_turn loop: Claude decides when to call tools, the backend executes them against real data, results feed back into the conversation
- Explain why this is better than one-shot: the agent can compare all 5 scenarios in a single turn by calling `compare_all_scenarios`, whereas a one-shot prompt would require the frontend to run 5 separate simulations
- Explain the transient portfolio pattern: why agent simulations don't persist to PostgreSQL
- Explain tool call transparency: `toolCallsMade` is returned in every response so the UI can show the user exactly what the agent did

**On the data layer:**
- Explain why the Python data service uses curl_cffi instead of the yFinance library: Yahoo Finance added bot detection that blocks the standard yFinance crumb-based flow, so we call the v8 chart API directly with Chrome TLS fingerprinting
- Explain Redis caching: why 24hr TTL is appropriate (historical prices don't change), graceful degradation if Redis is down

**On architecture:**
- Explain why Redis for caching vs PostgreSQL: Redis is a key-value store optimized for reads, microsecond latency vs millisecond for PostgreSQL queries
- Explain why the Python microservice is separate from Spring Boot: language-appropriate tooling (curl_cffi is Python-native), independently deployable, can be scaled or replaced without touching the main API
- Explain Spring Data JPA: entity classes annotated with `@Entity` map to DB tables via Hibernate, `@Repository` interfaces get CRUD methods for free, no SQL written for standard operations

**On Goldman relevance:**
- Explain how stress testing maps to what AWM engineers actually build: scenario analysis is a core function in any risk management platform
- Explain why you chose Kotlin over Java: null safety, data classes, extension functions, Goldman's preference

---

## What Goldman Engineers Will Notice

- You modeled the right domain (portfolio risk, not just stock prices)
- You used Spring Boot + Kotlin — their actual stack
- You used both relational and non-relational databases intentionally
- You have a caching layer with graceful degradation (production thinking)
- You separated concerns into microservices (data fetching vs. business logic vs. AI)
- You used Spring Data JPA — same ORM pattern as Goldman's internal services
- You have a real agentic AI layer, not just a chatbot — it calls real tools against real data
- The agent architecture is stateless (conversation history is client-side) — scales horizontally
- Tool call transparency is built into the API contract — auditability matters in finance
- You bypassed Yahoo Finance bot detection with Chrome TLS fingerprinting — you solved a real engineering problem, not a toy one
- You can speak to the financial concepts behind the code
- The AI layer augments the tool rather than being the tool
