package com.vantage.backend.dto

import jakarta.validation.constraints.NotEmpty
import java.math.BigDecimal
import java.util.UUID

data class CreatePortfolioRequest(
    @field:NotEmpty
    val name: String,

    @field:NotEmpty
    val holdings: List<HoldingRequest>
)

data class PortfolioResponse(
    val id: UUID,
    val name: String,
    val holdings: List<HoldingResponse>
)

data class HoldingResponse(
    val ticker: String,
    val weight: BigDecimal
)
