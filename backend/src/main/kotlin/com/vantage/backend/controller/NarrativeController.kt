package com.vantage.backend.controller

import com.vantage.backend.dto.NarrativeRequest
import com.vantage.backend.dto.NarrativeResponse
import com.vantage.backend.repository.ScenarioRepository
import com.vantage.backend.service.NarrativeService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/narratives")
class NarrativeController(
    private val narrativeService: NarrativeService,
    private val scenarioRepository: ScenarioRepository
) {

    @PostMapping
    fun generate(@Valid @RequestBody request: NarrativeRequest): NarrativeResponse {
        val scenario = scenarioRepository.findById(request.scenarioId).orElseThrow {
            NoSuchElementException("Scenario not found: ${request.scenarioId}")
        }
        return narrativeService.generateNarrative(
            portfolioSummary = request.portfolioSummary,
            scenario = scenario,
            metrics = request.metrics
        )
    }
}
