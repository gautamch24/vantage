package com.vantage.backend.repository

import com.vantage.backend.model.Portfolio
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PortfolioRepository : JpaRepository<Portfolio, UUID>
