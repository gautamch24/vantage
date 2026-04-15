package com.vantage.backend.dto

import java.math.BigDecimal
import java.time.LocalDate

data class SimulateResponse(
    val metrics: MetricsDto,
    val timeseries: List<TimeseriesPoint>,
    val holdingsBreakdown: List<HoldingBreakdown>
)

data class MetricsDto(
    val maxDrawdown: BigDecimal,
    val worstSingleDay: BigDecimal,
    val recoveryDays: Int?,
    val sharpeRatio: BigDecimal,
    val annualizedVolatility: BigDecimal,
    val beta: BigDecimal
)

data class TimeseriesPoint(
    val date: LocalDate,
    val value: BigDecimal
)

data class HoldingBreakdown(
    val ticker: String,
    val drawdown: BigDecimal,
    val weight: BigDecimal
)
