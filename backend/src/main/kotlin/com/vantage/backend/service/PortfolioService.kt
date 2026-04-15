package com.vantage.backend.service

import com.vantage.backend.dto.CreatePortfolioRequest
import com.vantage.backend.dto.HoldingResponse
import com.vantage.backend.dto.PortfolioResponse
import com.vantage.backend.model.Holding
import com.vantage.backend.model.Portfolio
import com.vantage.backend.repository.PortfolioRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.util.UUID

@Service
class PortfolioService(
    private val portfolioRepository: PortfolioRepository
) {

    @Transactional
    fun createPortfolio(request: CreatePortfolioRequest): PortfolioResponse {
        val totalWeight = request.holdings.sumOf { it.weight }
        require(totalWeight.compareTo(BigDecimal("100.00")) == 0) {
            "Portfolio weights must sum to 100. Got: $totalWeight"
        }

        val portfolio = Portfolio(name = request.name)
        request.holdings.forEach { holdingRequest ->
            portfolio.holdings.add(
                Holding(
                    portfolio = portfolio,
                    ticker = holdingRequest.ticker.uppercase(),
                    weight = holdingRequest.weight
                )
            )
        }

        val saved = portfolioRepository.save(portfolio)
        return saved.toResponse()
    }

    fun getPortfolio(id: UUID): PortfolioResponse {
        val portfolio = portfolioRepository.findById(id).orElseThrow {
            NoSuchElementException("Portfolio not found: $id")
        }
        return portfolio.toResponse()
    }

    fun getAllPortfolios(): List<PortfolioResponse> {
        return portfolioRepository.findAll().map { it.toResponse() }
    }

    fun getPortfolioEntity(id: UUID): Portfolio {
        return portfolioRepository.findById(id).orElseThrow {
            NoSuchElementException("Portfolio not found: $id")
        }
    }

    private fun Portfolio.toResponse() = PortfolioResponse(
        id = id!!,
        name = name,
        holdings = holdings.map { HoldingResponse(ticker = it.ticker, weight = it.weight) }
    )
}
