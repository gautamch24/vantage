package com.vantage.backend.model

import jakarta.persistence.*
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "scenarios")
data class Scenario(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false, length = 100)
    val name: String,

    @Column(columnDefinition = "TEXT")
    val description: String,

    @Column(name = "start_date", nullable = false)
    val startDate: LocalDate,

    @Column(name = "end_date", nullable = false)
    val endDate: LocalDate,

    @Column(name = "crisis_summary", columnDefinition = "TEXT")
    val crisisSummary: String
)
