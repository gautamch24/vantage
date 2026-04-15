package com.vantage.backend.controller

import com.vantage.backend.dto.CreatePortfolioRequest
import com.vantage.backend.dto.PortfolioResponse
import com.vantage.backend.service.PortfolioService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/portfolios")
class PortfolioController(private val portfolioService: PortfolioService) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: CreatePortfolioRequest): PortfolioResponse =
        portfolioService.createPortfolio(request)

    @GetMapping
    fun getAll(): List<PortfolioResponse> = portfolioService.getAllPortfolios()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: UUID): PortfolioResponse = portfolioService.getPortfolio(id)
}
