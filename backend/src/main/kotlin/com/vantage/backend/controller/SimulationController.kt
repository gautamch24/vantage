package com.vantage.backend.controller

import com.vantage.backend.dto.SimulateRequest
import com.vantage.backend.dto.SimulateResponse
import com.vantage.backend.model.Holding
import com.vantage.backend.model.Portfolio
import com.vantage.backend.service.PortfolioService
import com.vantage.backend.service.SimulationService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/simulate")
class SimulationController(
    private val simulationService: SimulationService,
    private val portfolioService: PortfolioService
) {

    /**
     * Run a stress test simulation.
     *
     * Accepts either:
     *   - portfolioId (UUID) → load saved portfolio from DB
     *   - holdings list → create transient portfolio (not saved to DB)
     */
    @PostMapping
    fun simulate(@Valid @RequestBody request: SimulateRequest): SimulateResponse {
        val portfolio = if (request.portfolioId != null) {
            portfolioService.getPortfolioEntity(request.portfolioId)
        } else {
            buildTransientPortfolio(request)
        }
        return simulationService.simulate(portfolio, request.scenarioId)
    }

    private fun buildTransientPortfolio(request: SimulateRequest): Portfolio {
        val holdings = request.holdings
        require(holdings.isNotEmpty()) { "Provide either portfolioId or a non-empty holdings list" }

        val totalWeight = holdings.sumOf { it.weight }
        require(totalWeight.compareTo(java.math.BigDecimal("100.00")) == 0) {
            "Portfolio weights must sum to 100. Got: $totalWeight"
        }

        val portfolio = Portfolio(name = "transient")
        holdings.forEach { h ->
            portfolio.holdings.add(
                Holding(portfolio = portfolio, ticker = h.ticker.uppercase(), weight = h.weight)
            )
        }
        return portfolio
    }
}
