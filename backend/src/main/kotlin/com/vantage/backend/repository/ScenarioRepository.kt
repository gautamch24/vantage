package com.vantage.backend.repository

import com.vantage.backend.model.Scenario
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ScenarioRepository : JpaRepository<Scenario, UUID>
