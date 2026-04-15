package com.vantage.backend.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "simulation_results")
data class SimulationResult(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    val portfolio: Portfolio,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scenario_id", nullable = false)
    val scenario: Scenario,

    @Column(name = "max_drawdown", precision = 8, scale = 4)
    val maxDrawdown: BigDecimal,

    @Column(name = "worst_day", precision = 8, scale = 4)
    val worstDay: BigDecimal,

    @Column(name = "recovery_days")
    val recoveryDays: Int?,

    @Column(name = "sharpe_ratio", precision = 8, scale = 4)
    val sharpeRatio: BigDecimal,

    @Column(name = "volatility", precision = 8, scale = 4)
    val volatility: BigDecimal,

    @Column(name = "beta", precision = 8, scale = 4)
    val beta: BigDecimal,

    @Column(name = "computed_at")
    val computedAt: LocalDateTime = LocalDateTime.now()
)
