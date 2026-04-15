"""
pytest tests for the data service.
Uses TestClient (no live yFinance calls — patches the fetch function).
"""

from datetime import date
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

MOCK_PRICES = [
    {"date": "2020-02-03", "close": 309.52},
    {"date": "2020-02-04", "close": 318.85},
    {"date": "2020-02-05", "close": 321.45},
]


# ---------------------------------------------------------------------------
# /health
# ---------------------------------------------------------------------------
def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# ---------------------------------------------------------------------------
# /data/prices — success path
# ---------------------------------------------------------------------------
def test_get_prices_returns_data():
    with patch("main.fetch_prices", return_value=MOCK_PRICES):
        response = client.get(
            "/data/prices",
            params={"ticker": "AAPL", "start": "2020-02-01", "end": "2020-04-30"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "AAPL"
    assert len(data["prices"]) == 3
    assert data["prices"][0]["date"] == "2020-02-03"
    assert data["prices"][0]["close"] == 309.52


def test_get_prices_empty_returns_404():
    with patch("main.fetch_prices", return_value=[]):
        response = client.get(
            "/data/prices",
            params={"ticker": "FAKEXYZ", "start": "2020-02-01", "end": "2020-04-30"},
        )
    assert response.status_code == 404


def test_get_prices_invalid_date_range():
    response = client.get(
        "/data/prices",
        params={"ticker": "AAPL", "start": "2020-04-30", "end": "2020-02-01"},
    )
    assert response.status_code == 400


# ---------------------------------------------------------------------------
# /data/validate
# ---------------------------------------------------------------------------
def test_validate_ticker_exists():
    mock_info = type("Info", (), {"market_cap": 2_000_000_000, "last_price": 150.0})()
    with (
        patch("main.fetch_prices", return_value=MOCK_PRICES),
        patch("yfinance.Ticker") as mock_ticker,
    ):
        mock_ticker.return_value.fast_info = mock_info
        response = client.get(
            "/data/validate",
            params={"ticker": "AAPL", "start": "2020-02-01", "end": "2020-04-30"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "AAPL"
    assert data["valid"] is True
    assert data["existsDuringPeriod"] is True


def test_validate_ticker_no_period_data():
    mock_info = type("Info", (), {"market_cap": 2_000_000_000, "last_price": 150.0})()
    with (
        patch("main.fetch_prices", return_value=[]),
        patch("yfinance.Ticker") as mock_ticker,
    ):
        mock_ticker.return_value.fast_info = mock_info
        response = client.get(
            "/data/validate",
            params={"ticker": "AAPL", "start": "1990-01-01", "end": "1990-12-31"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["existsDuringPeriod"] is False
