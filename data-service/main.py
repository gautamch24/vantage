"""
Python Data Service — Yahoo Finance proxy with Redis caching.

Calls Yahoo Finance v8 chart API directly (bypasses yFinance's broken crumb flow).

Endpoints:
  GET /data/prices?ticker=AAPL&start=2007-10-01&end=2009-03-31
  GET /data/validate?ticker=AAPL&start=2007-10-01&end=2009-03-31
  GET /health
"""

import json
import logging
import os
import time
from datetime import date, datetime, timedelta
from typing import Optional

import redis
from curl_cffi import requests as curl_requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Vantage Data Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Redis — gracefully degrades if unavailable
# ---------------------------------------------------------------------------
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
CACHE_TTL_SECONDS = 24 * 60 * 60

try:
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    redis_client.ping()
    logger.info("Redis connected at %s:%s", REDIS_HOST, REDIS_PORT)
except Exception:
    logger.warning("Redis unavailable — running without cache")
    redis_client = None

# ---------------------------------------------------------------------------
# HTTP session — curl_cffi impersonates Chrome TLS fingerprint,
# bypassing Yahoo Finance's browser detection and rate limiting
# ---------------------------------------------------------------------------
session = curl_requests.Session(impersonate="chrome120")

# Try query1 first, fall back to query2 on 429
YAHOO_HOSTS = [
    "https://query1.finance.yahoo.com",
    "https://query2.finance.yahoo.com",
]


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------
class PricePoint(BaseModel):
    date: str
    close: float


class PricesResponse(BaseModel):
    ticker: str
    prices: list[PricePoint]


class ValidateResponse(BaseModel):
    ticker: str
    valid: bool
    existsDuringPeriod: bool


# ---------------------------------------------------------------------------
# Cache helpers
# ---------------------------------------------------------------------------
def cache_key(ticker: str, start: date, end: date) -> str:
    return f"yfinance:{ticker.upper()}:{start}:{end}"


def get_cached(key: str) -> Optional[list[dict]]:
    if redis_client is None:
        return None
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else None
    except Exception as e:
        logger.warning("Cache read failed: %s", e)
        return None


def set_cached(key: str, data: list[dict]) -> None:
    if redis_client is None:
        return
    try:
        redis_client.setex(key, CACHE_TTL_SECONDS, json.dumps(data))
    except Exception as e:
        logger.warning("Cache write failed: %s", e)


# ---------------------------------------------------------------------------
# Yahoo Finance direct API fetch
# ---------------------------------------------------------------------------
def fetch_prices(ticker: str, start: date, end: date) -> list[dict]:
    key = cache_key(ticker, start, end)
    cached = get_cached(key)
    if cached is not None:
        logger.info("Cache hit for %s (%s → %s)", ticker, start, end)
        return cached

    logger.info("Fetching from Yahoo Finance: %s (%s → %s)", ticker, start, end)

    period1 = int(time.mktime(start.timetuple()))
    period2 = int(time.mktime((end + timedelta(days=1)).timetuple()))
    params = {"interval": "1d", "period1": period1, "period2": period2, "events": "div,splits"}

    data = None
    for attempt, host in enumerate(YAHOO_HOSTS):
        url = f"{host}/v8/finance/chart/{ticker}"
        try:
            if attempt > 0:
                time.sleep(1)  # brief pause before fallback host
            resp = session.get(url, params=params, timeout=15)
            if resp.status_code == 429:
                logger.warning("Rate limited on %s, trying next host", host)
                continue
            resp.raise_for_status()
            data = resp.json()
            break
        except Exception as e:
            logger.warning("Request failed on %s: %s", host, e)
            continue
        except ValueError as e:
            logger.warning("Invalid JSON from %s: %s", host, e)
            continue

    if data is None:
        logger.error("All Yahoo Finance hosts failed for %s", ticker)
        return []

    try:
        result = data["chart"]["result"]
        if not result:
            return []

        timestamps = result[0].get("timestamp", [])
        # Use adjclose (adjusted for splits + dividends) if available, else regular close
        indicators = result[0].get("indicators", {})
        adj_closes = indicators.get("adjclose", [{}])[0].get("adjclose", [])
        closes = indicators.get("quote", [{}])[0].get("close", [])

        price_list = adj_closes if adj_closes else closes

        prices = []
        for ts, close in zip(timestamps, price_list):
            if close is not None:
                day = datetime.utcfromtimestamp(ts).strftime("%Y-%m-%d")
                prices.append({"date": day, "close": round(float(close), 4)})

    except (KeyError, IndexError, TypeError) as e:
        logger.error("Failed to parse Yahoo Finance response for %s: %s", ticker, e)
        return []

    if prices:
        set_cached(key, prices)

    return prices


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok", "redis": redis_client is not None}


@app.get("/data/prices", response_model=PricesResponse)
def get_prices(
    ticker: str = Query(..., description="Stock ticker symbol, e.g. AAPL"),
    start: date = Query(..., description="Start date in YYYY-MM-DD format"),
    end: date = Query(..., description="End date in YYYY-MM-DD format"),
):
    if start >= end:
        raise HTTPException(status_code=400, detail="start must be before end")

    prices_raw = fetch_prices(ticker.upper(), start, end)

    if not prices_raw:
        raise HTTPException(
            status_code=404,
            detail=f"No price data found for {ticker} between {start} and {end}. "
                   f"The ticker may not exist or may not have traded during this period.",
        )

    prices = [PricePoint(date=p["date"], close=p["close"]) for p in prices_raw]
    return PricesResponse(ticker=ticker.upper(), prices=prices)


@app.get("/data/validate", response_model=ValidateResponse)
def validate_ticker(
    ticker: str = Query(...),
    start: date = Query(...),
    end: date = Query(...),
):
    ticker_upper = ticker.upper()

    # Check recent data to confirm ticker exists at all
    valid = False
    for host in YAHOO_HOSTS:
        url = f"{host}/v8/finance/chart/{ticker_upper}"
        try:
            resp = session.get(url, params={"range": "5d", "interval": "1d"}, timeout=10)
            if resp.status_code == 429:
                continue
            resp.raise_for_status()
            data = resp.json()
            result = data["chart"]["result"]
            valid = bool(result)
            break
        except Exception:
            continue
    if not valid:
        return ValidateResponse(ticker=ticker_upper, valid=False, existsDuringPeriod=False)

    prices = fetch_prices(ticker_upper, start, end)
    return ValidateResponse(
        ticker=ticker_upper,
        valid=True,
        existsDuringPeriod=len(prices) > 0,
    )
