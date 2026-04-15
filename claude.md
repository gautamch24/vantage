# CLAUDE.md — Portfolio Stress Testing Simulator

> Built to demonstrate AWM-relevant engineering: risk management, portfolio analysis, and full-stack development aligned with Goldman Sachs AWM SWE requirements.

---

## Project Overview

A full-stack web application that simulates how a user-defined portfolio of stocks would have performed during historical market stress events (2008 Financial Crisis, COVID Crash, etc.). The app pulls real historical price data, runs drawdown calculations, visualizes the portfolio's behavior through the crisis, and uses Claude AI to generate a plain-English narrative explaining what happened and why.

**The one-line pitch:** "What would happen to my portfolio if 2008 happened again tomorrow?"

---

## Why This Maps to the Goldman Sachs AWM JD

| JD Requirement | How This Project Covers It |
|---|---|
| Portfolio management functions | Core feature — user inputs and manages a portfolio |
| Risk management functions | Stress testing IS risk management |
| Capital management functions | Max drawdown = how much capital is at risk |
| Full-stack development | React frontend + Spring Boot backend + PostgreSQL |
| TypeScript + ReactJS | Entire frontend |
| Python | Data service layer (yFinance microservice) |
| SpringBoot / Kotlin | Main backend API, business logic, metrics calculation |
| Relational databases | PostgreSQL for portfolios and scenarios |
| Non-relational databases | Redis for caching yFinance API responses |
| Analytical + programming skills | Financial metric calculations (drawdown, Sharpe, VaR) |
| Translate business requirements into applications | AWM workflow → working tool |
| Microservices architecture | Spring Boot service + Python data service communicating over HTTP |

---

## Concepts to Learn While Building (Goldman Vocabulary)

Before building each section, understand these terms — you will be asked about them in interviews:

### Risk Management Concepts
- **Drawdown** — The percentage drop from a portfolio's peak value to its lowest point during a period. Max drawdown is the worst single drop. Formula: `(trough - peak) / peak`
- **Value at Risk (VaR)** — The maximum expected loss over a given period at a given confidence level. Example: "95% VaR of $10,000 means there's a 5% chance of losing more than $10k in a day."
- **Sharpe Ratio** — Return divided by volatility. Measures how much return you're getting per unit of risk. Higher is better. Formula: `(portfolio_return - risk_free_rate) / std_deviation`
- **Volatility** — Standard deviation of daily returns. Higher volatility = more unpredictable = riskier.
- **Beta** — How much your portfolio moves relative to the market (S&P 500). Beta of 1.5 means if the market drops 10%, your portfolio drops 15%.
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
- **Microservices** — The Spring Boot service (main API, metrics, DB) and the Python data service (yFinance proxy) are separate deployable units that communicate over HTTP. This is how Goldman's systems are structured. The Spring Boot service calls the Python service's `/data/prices` endpoint to get historical prices.
- **Caching** — The Python data service caches yFinance responses in Redis so we don't re-fetch historical data on every request. Same pattern Goldman uses for market data feeds.
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

### Secondary
6. As a user, I want to compare two portfolios side-by-side under the same scenario so I can evaluate diversification tradeoffs.
7. As a user, I want to save a portfolio so I can re-run different scenarios without re-entering tickers.
8. As a user, I want to see which individual holdings were hit hardest so I can identify concentration risk.
9. As a user, I want a correlation heatmap of my holdings during the crisis period so I can see how diversification broke down.

### Stretch
10. As a user, I want to run a custom date-range scenario (not just presets) so I can test against any market period.
11. As a user, I want to export the results as a PDF report.

---

## Features

### Feature 1: Portfolio Builder
- Ticker input with weight assignment (must sum to 100%)
- Real-time ticker validation against yFinance
- Preset portfolios for demo purposes (e.g., "Tech-Heavy", "Balanced 60/40", "Goldman Sachs Benchmark")
- Save portfolio to PostgreSQL

### Feature 2: Scenario Selector
Preloaded historical stress scenarios stored in the database:

| Scenario | Date Range | What Happened |
|---|---|---|
| 2008 Financial Crisis | Oct 2007 – Mar 2009 | Housing collapse, Lehman bankruptcy, credit freeze |
| COVID Crash | Feb 2020 – Apr 2020 | Global pandemic, fastest 30% drop in market history |
| Dot-com Bubble | Mar 2000 – Oct 2002 | Tech valuation collapse, NASDAQ dropped 78% |
| 2022 Rate Shock | Jan 2022 – Oct 2022 | Fed rate hikes crushed growth stocks and bonds |
| Black Monday 1987 | Oct 1987 | Single-day 22% market drop |

### Feature 3: Simulation Engine (Backend Core)
- Fetch historical OHLC data for each ticker via yFinance
- Normalize prices to day 0 of the scenario
- Apply portfolio weights to compute blended portfolio value
- Calculate metrics:
  - Max Drawdown
  - Worst Single Day
  - Recovery Time (days to return to pre-crisis value)
  - Annualized Volatility
  - Sharpe Ratio during period
  - Beta vs S&P 500
- Cache results in Redis to avoid redundant API calls

### Feature 4: Results Dashboard
- **Line chart** — Portfolio value over crisis period (normalized to $100 starting value)
- **Metric cards** — Max drawdown, worst day, recovery time, Sharpe ratio
- **Holdings breakdown table** — Each ticker's individual drawdown during the scenario
- **Correlation heatmap** — Asset correlations during the stress period vs. normal period

### Feature 5: Claude AI Narrative
Prompt Claude with the portfolio composition, scenario context, and computed metrics. Claude returns a 3-4 paragraph plain-English explanation covering:
- What caused this crisis
- Why specific holdings in the portfolio were hit hard
- What the max drawdown and recovery time mean in practical terms
- What this tells us about the portfolio's risk profile

### Feature 6: Portfolio Comparison (Secondary)
- Run two portfolios through the same scenario simultaneously
- Side-by-side line chart
- Delta metrics (which portfolio lost more, recovered faster)

---

## Tech Stack

### Frontend
```
Next.js 15 (App Router)
TypeScript
Tailwind CSS
Recharts — line charts, drawdown visualization
shadcn/ui — component library
Axios — API calls
```

**Why this for Goldman:** TypeScript + ReactJS are explicitly in the JD. Next.js gives you SSR which matters for data-heavy financial dashboards.

### Backend — Spring Boot Service (Main API)
```
Kotlin
Spring Boot 3.x
Spring Web — REST controllers
Spring Data JPA + Hibernate — ORM for PostgreSQL
PostgreSQL driver
Spring Cache + Redis — caching layer
JUnit 5 + MockK — unit and integration tests
Gradle — build tool
JDK 17
```

**Why this for Goldman:** This is exactly the stack Goldman uses. Controllers → Services → Repositories is the Spring pattern. Kotlin is Goldman's preferred JVM language over Java.

### Backend — Python Data Service (yFinance Microservice)
```
Python 3.11
FastAPI — lightweight REST API
yFinance — historical stock price data
pandas + numpy — data normalization
redis-py — cache yFinance responses
pytest — tests
```

**Role:** Purely a data proxy. The Spring Boot service calls `GET /data/prices?ticker=AAPL&start=...&end=...` and gets back JSON price data. No business logic lives here.

### Databases
```
PostgreSQL — portfolios, saved scenarios, user sessions (relational)
Redis — yFinance API response cache, session state (non-relational)
```

**Why both:** Directly mirrors the JD's "relational and non-relational databases" requirement. Be ready to explain why you used each one.

### AI
```
Claude API (claude-sonnet-4-20250514) — narrative generation
```

### Infrastructure
```
Docker Compose — run Postgres + Redis locally
Vercel — frontend deployment
Railway or Render — Spring Boot + Python data service deployment
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                   │
│  Portfolio Builder → Scenario Selector → Dashboard   │
└─────────────────────┬───────────────────────────────┘
                      │ REST API calls
┌─────────────────────▼───────────────────────────────┐
│           Spring Boot Backend (Kotlin)                │
│                                                       │
│  POST /api/portfolios     — save portfolio            │
│  GET  /api/scenarios      — list stress scenarios     │
│  POST /api/simulate       — run stress test           │
│  POST /api/narratives     — generate Claude summary   │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │ Simulation   │  │  Narrative   │                   │
│  │ Service      │  │  Service     │                   │
│  │              │  │              │                   │
│  │ - call data  │  │ - build      │                   │
│  │   service    │  │   prompt     │                   │
│  │ - calc       │  │ - call       │                   │
│  │   metrics    │  │   Claude API │                   │
│  │ - normalize  │  │              │                   │
│  └──────┬───────┘  └──────────────┘                  │
│         │                                             │
│  ┌──────▼───────┐  ┌──────────────┐                  │
│  │  PostgreSQL  │  │  Spring Data │                   │
│  │  (portfolios,│  │  JPA / Hiber-│                   │
│  │  scenarios,  │  │  nate ORM    │                   │
│  │  results)    │  └──────────────┘                   │
│  └──────────────┘                                     │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP calls to data service
┌─────────────────────▼───────────────────────────────┐
│           Python Data Service (FastAPI)               │
│                                                       │
│  GET /data/prices   — fetch OHLC for ticker+range    │
│  GET /data/validate — check ticker exists            │
│                                                       │
│  ┌──────────────┐                                    │
│  │   Redis      │                                    │
│  │   Cache      │                                    │
│  │ (yFinance    │                                    │
│  │  responses)  │                                    │
│  └──────────────┘                                    │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                  Yahoo Finance (yFinance)              │
│           (historical OHLC price data)                │
└─────────────────────────────────────────────────────┘
```

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

-- Predefined stress scenarios
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  crisis_summary TEXT -- what caused it, for Claude context
);

-- Simulation results (cache computed metrics)
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
Value: JSON serialized OHLC dataframe
TTL: 24 hours
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
  "scenario_id": "uuid-of-2008-crisis"
}
```

**Response:**
```json
{
  "metrics": {
    "max_drawdown": -0.412,
    "worst_single_day": -0.089,
    "recovery_days": 847,
    "sharpe_ratio": -1.23,
    "annualized_volatility": 0.34,
    "beta": 1.18
  },
  "timeseries": [
    { "date": "2007-10-01", "value": 100.0 },
    { "date": "2007-10-02", "value": 99.3 },
    ...
  ],
  "holdings_breakdown": [
    { "ticker": "AAPL", "drawdown": -0.58, "weight": 40 },
    { "ticker": "JPM", "drawdown": -0.71, "weight": 40 },
    { "ticker": "BND", "drawdown": -0.04, "weight": 20 }
  ]
}
```

### POST /api/narratives
**Request:**
```json
{
  "portfolio_summary": "40% AAPL, 40% JPM, 20% BND",
  "scenario_name": "2008 Financial Crisis",
  "crisis_summary": "Housing collapse...",
  "metrics": { ... }
}
```

**Response:**
```json
{
  "narrative": "Your portfolio would have experienced a 41.2% peak-to-trough decline during the 2008 Financial Crisis..."
}
```

---

## Edge Cases

### Data
- **Ticker doesn't exist on yFinance** — return a 400 with a clear error message, highlight the bad ticker in the UI
- **Ticker didn't exist during the scenario period** — e.g., a company that IPO'd after 2008. Return a warning and exclude from simulation or substitute with sector ETF
- **Weights don't sum to 100%** — validate on frontend in real time, block submission
- **Duplicate tickers in portfolio** — merge weights, warn the user
- **yFinance rate limit or timeout** — retry with exponential backoff, show loading state

### Calculation
- **Missing price data for specific dates** — use forward-fill (carry last known price forward), standard practice in finance
- **Stock split during scenario period** — yFinance auto-adjusts for splits, but document this assumption
- **Dividends** — use adjusted close prices which account for dividends. Document this.
- **Portfolio hasn't recovered by end of scenario date** — recovery_days returns null, UI shows "Not recovered within scenario window"

### UX
- **User enters a single ticker at 100%** — valid, but show a concentration risk warning
- **Very short scenario period** — some metrics (Sharpe, annualized volatility) are unreliable on short windows. Show a caveat.
- **Claude API failure** — gracefully degrade, show metrics without narrative, display "AI summary unavailable"

---

## Build Order

### Phase 1: Infrastructure — COMPLETE
- [x] Git repo initialized
- [x] Monorepo structure (`/frontend`, `/backend`, `/data-service`)
- [x] `docker-compose.yml` — PostgreSQL (5432) + Redis (6379) with health checks
- [x] `.gitignore`
- [ ] Seed scenarios table with 5 historical crises (done in Phase 3 via data loader)

### Phase 2: Python Data Service — TODO
- [ ] FastAPI project setup in `/data-service`
- [ ] yFinance price fetching endpoint (`GET /data/prices`)
- [ ] Ticker validation endpoint (`GET /data/validate`)
- [ ] Redis caching layer (24hr TTL)
- [ ] pytest tests

### Phase 3: Spring Boot Backend — IN PROGRESS
**Scaffolded via Spring Initializr (Spring Boot 3.5.0, JDK 17, Gradle)**

- [x] Project scaffold — `build.gradle.kts`, Gradle wrapper, `application.yml`
- [x] Dependencies — Spring Web, Data JPA, PostgreSQL, Redis, Cache, Validation

**Models (JPA entities → Hibernate auto-creates tables)**
- [x] `Portfolio.kt` — portfolios table
- [x] `Holding.kt` — holdings table (ManyToOne → Portfolio)
- [x] `Scenario.kt` — scenarios table
- [x] `SimulationResult.kt` — simulation_results table (ManyToOne → Portfolio + Scenario)

**Repositories (Spring Data JPA — no SQL written)**
- [x] `PortfolioRepository.kt`
- [x] `ScenarioRepository.kt`
- [x] `SimulationResultRepository.kt` — includes `findByPortfolioIdAndScenarioId`

**DTOs (JSON shapes — separate from DB entities)**
- [x] `SimulateRequest.kt` — HoldingRequest (ticker + weight), scenarioId
- [x] `SimulateResponse.kt` — MetricsDto, TimeseriesPoint, HoldingBreakdown
- [x] `NarrativeDto.kt` — NarrativeRequest, NarrativeResponse
- [x] `PortfolioDto.kt` — CreatePortfolioRequest, PortfolioResponse, HoldingResponse

**Config**
- [x] `AppConfig.kt` — RestTemplate bean

**Client**
- [x] `DataServiceClient.kt` — HTTP calls to Python data service (`getPrices`, `validateTicker`)

**Services**
- [x] `SimulationService.kt` — full simulation engine
  - Fetches prices via DataServiceClient
  - Finds common trading dates across all tickers
  - Normalizes prices to 100 on day 0
  - Computes weighted portfolio timeseries
  - Calculates: max drawdown, worst day, recovery days, Sharpe, volatility, beta
  - Per-holding breakdown
  - Persists SimulationResult to DB
- [x] `NarrativeService.kt` — Claude API integration
  - Builds prompt with portfolio, scenario context, and computed metrics
  - Direct HTTP POST to Anthropic API (no SDK)
- [x] `PortfolioService.kt` — portfolio CRUD
  - Weight validation (must sum to 100)
  - Entity ↔ DTO conversion via extension functions

**TODO — Spring Boot**
- [ ] `ScenarioDataLoader.kt` — seed 5 historical crises on startup
- [ ] Controllers: `PortfolioController`, `ScenarioController`, `SimulationController`, `NarrativeController`
- [ ] `GlobalExceptionHandler.kt` — consistent error responses
- [ ] `CorsConfig.kt` — allow frontend origin
- [ ] JUnit 5 tests

### Phase 4: Frontend — TODO
- [ ] Next.js 15 + TypeScript scaffold in `/frontend`
- [ ] Portfolio builder form with weight validation
- [ ] Scenario selector
- [ ] Recharts line chart for timeseries
- [ ] Metric cards

### Phase 5: Polish + Deploy — TODO
- [ ] Claude narrative display
- [ ] Holdings breakdown table + correlation heatmap
- [ ] Error states and loading states
- [ ] Deploy: Vercel (frontend) + Railway (Spring Boot + Python data service)

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
│   │   │   └── AppConfig.kt
│   │   ├── controller/          (empty — next up)
│   │   ├── dto/
│   │   │   ├── NarrativeDto.kt
│   │   │   ├── PortfolioDto.kt
│   │   │   ├── SimulateRequest.kt
│   │   │   └── SimulateResponse.kt
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
│   │       ├── NarrativeService.kt
│   │       ├── PortfolioService.kt
│   │       └── SimulationService.kt
│   ├── src/main/resources/
│   │   └── application.yml
│   └── build.gradle.kts
├── data-service/                (empty — Phase 2)
├── frontend/                    (empty — Phase 4)
├── docker-compose.yml
├── .gitignore
└── claude.md
```

---

## Interview Talking Points

When asked about this project, lead with the business problem not the tech:

> "I built a stress testing simulator for portfolio risk management. The core problem AWM faces is understanding how client portfolios behave under extreme market conditions. I modeled five historical crises, built a simulation engine that applies real historical price movements to user-defined portfolios, and layered in an AI narrative layer that explains the results in plain English — the same way an analyst would present findings to a client."

Then go technical:
- Explain the drawdown calculation
- Explain why you used Redis for caching
- Explain the difference between max drawdown and VaR
- Explain why correlations spike during crises (diversification breaks down)
- Explain the Spring Boot controller → service → repository pattern and how it maps to Goldman's production systems
- Explain why you separated the yFinance data fetching into a Python microservice (language-appropriate tooling, separation of concerns, independently deployable and scalable)
- Explain Spring Data JPA and Hibernate ORM — how entity classes map to DB tables, how repositories eliminate boilerplate SQL

---

## What Goldman Engineers Will Notice

- You modeled the right domain (portfolio risk, not just stock prices)
- You used Spring Boot + Kotlin — their actual stack
- You used both relational and non-relational databases intentionally
- You have a caching layer (production thinking)
- You separated concerns into microservices (data fetching vs. business logic)
- You used Spring Data JPA — same ORM pattern as Goldman's internal services
- You wrote tests (JUnit 5 for Spring Boot, pytest for data service)
- You can speak to the financial concepts behind the code
- The AI layer augments the tool rather than being the tool