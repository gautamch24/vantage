package com.vantage.backend.service

import com.vantage.backend.client.DataServiceClient
import com.vantage.backend.client.PricePoint
import com.vantage.backend.dto.*
import com.vantage.backend.model.Portfolio
import com.vantage.backend.model.SimulationResult
import com.vantage.backend.repository.ScenarioRepository
import com.vantage.backend.repository.SimulationResultRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.util.UUID
import kotlin.math.pow
import kotlin.math.sqrt

@Service
class SimulationService(
    private val dataServiceClient: DataServiceClient,
    private val scenarioRepository: ScenarioRepository,
    private val simulationResultRepository: SimulationResultRepository
) {

    // Risk-free rate: ~5% annual → daily
    private val dailyRiskFreeRate = 0.05 / 252

    @Transactional
    fun simulate(portfolio: Portfolio, scenarioId: UUID): SimulateResponse {
        val scenario = scenarioRepository.findById(scenarioId).orElseThrow {
            IllegalArgumentException("Scenario not found: $scenarioId")
        }

        // 1. Fetch price data for every holding + S&P 500 (SPY) for beta
        val tickers = portfolio.holdings.map { it.ticker }
        val allTickers = tickers + "SPY"

        val priceData = allTickers.associateWith { ticker ->
            dataServiceClient.getPrices(ticker, scenario.startDate, scenario.endDate).prices
        }

        // 2. Find dates that exist across ALL tickers (common trading days)
        val commonDates = priceData.values
            .map { prices -> prices.map { it.date }.toSet() }
            .reduce { acc, dates -> acc.intersect(dates) }
            .sorted()

        if (commonDates.isEmpty()) throw IllegalStateException("No common trading days found across holdings")

        // 3. Normalize each ticker's prices to 100 on day 0
        val normalizedPrices = priceData.mapValues { (_, prices) ->
            normalizePrices(prices, commonDates)
        }

        // 4. Compute weighted portfolio value per day
        val portfolioTimeseries = computePortfolioTimeseries(
            normalizedPrices, portfolio, commonDates
        )

        // 5. Calculate all metrics
        val portfolioValues = portfolioTimeseries.map { it.value.toDouble() }
        val spyValues = commonDates.map { date -> normalizedPrices["SPY"]!![date]!! }

        val metrics = calculateMetrics(portfolioValues, spyValues, commonDates)

        // 6. Per-holding breakdown (individual drawdowns)
        val holdingsBreakdown = portfolio.holdings.map { holding ->
            val values = commonDates.map { date -> normalizedPrices[holding.ticker]!![date]!! }
            HoldingBreakdown(
                ticker = holding.ticker,
                drawdown = calculateMaxDrawdown(values).toBigDecimal().setScale(4, RoundingMode.HALF_UP),
                weight = holding.weight
            )
        }

        // 7. Persist result only for saved portfolios (not transient/anonymous ones)
        if (portfolio.id != null) {
            val result = SimulationResult(
                portfolio = portfolio,
                scenario = scenario,
                maxDrawdown = metrics.maxDrawdown,
                worstDay = metrics.worstSingleDay,
                recoveryDays = metrics.recoveryDays,
                sharpeRatio = metrics.sharpeRatio,
                volatility = metrics.annualizedVolatility,
                beta = metrics.beta
            )
            simulationResultRepository.save(result)
        }

        return SimulateResponse(
            metrics = metrics,
            timeseries = portfolioTimeseries,
            holdingsBreakdown = holdingsBreakdown
        )
    }

    // -------------------------------------------------------------------------
    // Normalize prices: set day 0 = 100, all subsequent days relative to that
    // -------------------------------------------------------------------------
    private fun normalizePrices(
        prices: List<PricePoint>,
        commonDates: List<LocalDate>
    ): Map<LocalDate, Double> {
        val priceByDate = prices.associateBy { it.date }
        val day0Price = priceByDate[commonDates.first()]!!.close.toDouble()

        return commonDates.associateWith { date ->
            (priceByDate[date]!!.close.toDouble() / day0Price) * 100.0
        }
    }

    // -------------------------------------------------------------------------
    // Blend each holding's normalized value by its weight to get portfolio value
    // e.g. 40% AAPL + 60% JPM → weighted average each day
    // -------------------------------------------------------------------------
    private fun computePortfolioTimeseries(
        normalizedPrices: Map<String, Map<LocalDate, Double>>,
        portfolio: Portfolio,
        commonDates: List<LocalDate>
    ): List<TimeseriesPoint> {
        return commonDates.map { date ->
            val portfolioValue = portfolio.holdings.sumOf { holding ->
                val tickerValue = normalizedPrices[holding.ticker]!![date]!!
                tickerValue * holding.weight.toDouble() / 100.0
            }
            TimeseriesPoint(
                date = date,
                value = portfolioValue.toBigDecimal().setScale(4, RoundingMode.HALF_UP)
            )
        }
    }

    // -------------------------------------------------------------------------
    // Max Drawdown: peak-to-trough percentage drop
    // Formula: (trough - peak) / peak
    // -------------------------------------------------------------------------
    private fun calculateMaxDrawdown(values: List<Double>): Double {
        var peak = values.first()
        var maxDrawdown = 0.0

        for (value in values) {
            if (value > peak) peak = value
            val drawdown = (value - peak) / peak
            if (drawdown < maxDrawdown) maxDrawdown = drawdown
        }
        return maxDrawdown
    }

    // -------------------------------------------------------------------------
    // Daily returns: (today - yesterday) / yesterday
    // Used for Sharpe, volatility, worst day
    // -------------------------------------------------------------------------
    private fun dailyReturns(values: List<Double>): List<Double> {
        return values.zipWithNext { yesterday, today -> (today - yesterday) / yesterday }
    }

    // -------------------------------------------------------------------------
    // Recovery Days: days from start until portfolio returns to 100
    // Returns null if portfolio never recovers within the scenario window
    // -------------------------------------------------------------------------
    private fun calculateRecoveryDays(values: List<Double>, dates: List<LocalDate>): Int? {
        val startValue = values.first()
        val troughIndex = values.indices.minByOrNull { values[it] } ?: return null

        for (i in troughIndex until values.size) {
            if (values[i] >= startValue) {
                return (dates[i].toEpochDay() - dates[0].toEpochDay()).toInt()
            }
        }
        return null
    }

    // -------------------------------------------------------------------------
    // Sharpe Ratio: (mean return - risk free rate) / std dev * sqrt(252)
    // Annualized — sqrt(252) scales daily stats to annual
    // -------------------------------------------------------------------------
    private fun calculateSharpe(returns: List<Double>): Double {
        val mean = returns.average()
        val stdDev = stdDev(returns)
        if (stdDev == 0.0) return 0.0
        return ((mean - dailyRiskFreeRate) / stdDev) * sqrt(252.0)
    }

    // -------------------------------------------------------------------------
    // Beta: how much the portfolio moves relative to the market (SPY)
    // Formula: covariance(portfolio, market) / variance(market)
    // Beta > 1 = more volatile than market, Beta < 1 = less volatile
    // -------------------------------------------------------------------------
    private fun calculateBeta(portfolioReturns: List<Double>, marketReturns: List<Double>): Double {
        val marketVariance = variance(marketReturns)
        if (marketVariance == 0.0) return 1.0
        return covariance(portfolioReturns, marketReturns) / marketVariance
    }

    private fun calculateMetrics(
        portfolioValues: List<Double>,
        spyValues: List<Double>,
        dates: List<LocalDate>
    ): MetricsDto {
        val portfolioReturns = dailyReturns(portfolioValues)
        val marketReturns = dailyReturns(spyValues)

        val scale = 4
        return MetricsDto(
            maxDrawdown = calculateMaxDrawdown(portfolioValues)
                .toBigDecimal().setScale(scale, RoundingMode.HALF_UP),
            worstSingleDay = (portfolioReturns.minOrNull() ?: 0.0)
                .toBigDecimal().setScale(scale, RoundingMode.HALF_UP),
            recoveryDays = calculateRecoveryDays(portfolioValues, dates),
            sharpeRatio = calculateSharpe(portfolioReturns)
                .toBigDecimal().setScale(scale, RoundingMode.HALF_UP),
            annualizedVolatility = (stdDev(portfolioReturns) * sqrt(252.0))
                .toBigDecimal().setScale(scale, RoundingMode.HALF_UP),
            beta = calculateBeta(portfolioReturns, marketReturns)
                .toBigDecimal().setScale(scale, RoundingMode.HALF_UP)
        )
    }

    // -------------------------------------------------------------------------
    // Math helpers
    // -------------------------------------------------------------------------
    private fun mean(values: List<Double>) = values.average()

    private fun variance(values: List<Double>): Double {
        val m = mean(values)
        return values.sumOf { (it - m).pow(2) } / values.size
    }

    private fun stdDev(values: List<Double>) = sqrt(variance(values))

    private fun covariance(x: List<Double>, y: List<Double>): Double {
        val mx = mean(x)
        val my = mean(y)
        return x.zip(y).sumOf { (xi, yi) -> (xi - mx) * (yi - my) } / x.size
    }
}
