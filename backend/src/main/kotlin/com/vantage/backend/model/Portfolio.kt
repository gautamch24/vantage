package com.vantage.backend.model

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "portfolios")
data class Portfolio(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false, length = 100)
    val name: String,

    @OneToMany(mappedBy = "portfolio", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.EAGER)
    val holdings: MutableList<Holding> = mutableListOf(),

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now()
)
