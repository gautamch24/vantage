package com.vantage.backend.controller

import com.vantage.backend.model.Scenario
import com.vantage.backend.repository.ScenarioRepository
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/scenarios")
class ScenarioController(private val scenarioRepository: ScenarioRepository) {

    @GetMapping
    fun getAll(): List<Scenario> = scenarioRepository.findAll()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: UUID): Scenario =
        scenarioRepository.findById(id).orElseThrow {
            NoSuchElementException("Scenario not found: $id")
        }
}
