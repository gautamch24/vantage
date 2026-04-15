package com.vantage.backend.repository

import com.vantage.backend.model.SimulationResult
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SimulationResultRepository : JpaRepository<SimulationResult, UUID> {
    fun findByPortfolioIdAndScenarioId(portfolioId: UUID, scenarioId: UUID): SimulationResult?
}
