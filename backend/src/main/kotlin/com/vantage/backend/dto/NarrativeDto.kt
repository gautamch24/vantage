package com.vantage.backend.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.util.UUID

data class NarrativeRequest(
    @field:NotBlank
    val portfolioSummary: String,

    @field:NotNull
    val scenarioId: UUID,

    val metrics: MetricsDto
)

data class NarrativeResponse(
    val narrative: String
)
