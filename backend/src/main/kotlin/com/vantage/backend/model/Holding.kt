package com.vantage.backend.model

import jakarta.persistence.*
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import java.math.BigDecimal
import java.util.UUID

@Entity
@Table(name = "holdings")
data class Holding(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    val portfolio: Portfolio,

    @Column(nullable = false, length = 10)
    val ticker: String,

    @Column(nullable = false, precision = 5, scale = 2)
    @DecimalMin("0.01") @DecimalMax("100.0")
    val weight: BigDecimal
)
