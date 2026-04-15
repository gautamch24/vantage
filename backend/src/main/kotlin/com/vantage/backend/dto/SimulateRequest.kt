package com.vantage.backend.dto

import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal
import java.util.UUID

data class SimulateRequest(
    val holdings: List<HoldingRequest> = emptyList(),

    val portfolioId: UUID? = null,

    @field:NotNull
    val scenarioId: UUID
)

data class HoldingRequest(
    @field:NotEmpty
    val ticker: String,

    @field:NotNull
    val weight: BigDecimal
)
