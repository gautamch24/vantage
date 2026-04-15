package com.vantage.backend.service

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.vantage.backend.dto.AgentChatResponse
import com.vantage.backend.dto.HoldingRequest
import com.vantage.backend.dto.ToolCallRecord
import com.vantage.backend.model.Holding
import com.vantage.backend.model.Portfolio
import com.vantage.backend.repository.ScenarioRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import java.math.BigDecimal
import java.util.UUID

@Service
class AgentService(
    private val restTemplate: RestTemplate,
    private val scenarioRepository: ScenarioRepository,
    private val simulationService: SimulationService,
    @Value("\${anthropic.api-key}") private val apiKey: String
) {
    private val mapper = jacksonObjectMapper()
    private val claudeUrl = "https://api.anthropic.com/v1/messages"
    private val model = "claude-sonnet-4-6"
    private val maxIterations = 8

    fun chat(holdings: List<HoldingRequest>, userMessage: String): AgentChatResponse {
        val portfolioSummary = holdings.joinToString(", ") { "${it.weight.toInt()}% ${it.ticker}" }

        val systemPrompt = """
            You are VANTAGE, an AI risk analyst embedded in a portfolio stress testing platform.
            You analyze how portfolios perform during historical market crises.

            Current portfolio under analysis: $portfolioSummary

            You have tools to run simulations and compare scenarios. When answering:
            - Always call the relevant tools before responding — never guess numbers
            - Cite specific figures: max drawdown %, recovery days, Sharpe ratio, beta
            - Compare results when relevant (e.g. which scenario was worst)
            - Be concise but quantitative — like a Goldman Sachs quant analyst briefing a PM
            - If asked about a specific scenario, use run_simulation
            - If asked which scenario is worst/best, use compare_all_scenarios
        """.trimIndent()

        val messages = mutableListOf<Map<String, Any>>(
            mapOf("role" to "user", "content" to userMessage)
        )
        val toolCallLog = mutableListOf<ToolCallRecord>()

        repeat(maxIterations) {
            val response = callClaude(systemPrompt, messages, buildTools())
            val stopReason = response["stop_reason"] as String
            val contentBlocks = response["content"] as List<Map<String, Any>>

            if (stopReason == "end_turn") {
                val text = contentBlocks.firstOrNull { it["type"] == "text" }?.get("text") as? String
                    ?: "Analysis complete."
                return AgentChatResponse(content = text, toolCallsMade = toolCallLog)
            }

            if (stopReason == "tool_use") {
                messages.add(mapOf("role" to "assistant", "content" to contentBlocks))

                val toolResults = contentBlocks
                    .filter { it["type"] == "tool_use" }
                    .map { block ->
                        val toolName = block["name"] as String
                        @Suppress("UNCHECKED_CAST")
                        val toolInput = block["input"] as Map<String, Any>
                        val toolId = block["id"] as String

                        val result = executeTool(toolName, toolInput, holdings)
                        toolCallLog.add(ToolCallRecord(tool = toolName, summary = toolSummary(toolName, toolInput)))

                        mapOf(
                            "type" to "tool_result",
                            "tool_use_id" to toolId,
                            "content" to result
                        )
                    }

                messages.add(mapOf("role" to "user", "content" to toolResults))
            }
        }

        return AgentChatResponse(
            content = "I was unable to complete the analysis within the allowed steps.",
            toolCallsMade = toolCallLog
        )
    }

    // -------------------------------------------------------------------------
    // Tool definitions sent to Claude
    // -------------------------------------------------------------------------
    private fun buildTools(): List<Map<String, Any>> = listOf(
        mapOf(
            "name" to "list_scenarios",
            "description" to "List all available historical stress scenarios with their names, date ranges, and descriptions.",
            "input_schema" to mapOf(
                "type" to "object",
                "properties" to emptyMap<String, Any>(),
                "required" to emptyList<String>()
            )
        ),
        mapOf(
            "name" to "run_simulation",
            "description" to "Run a stress test for the current portfolio against a specific historical scenario. Returns max drawdown, worst single day, recovery days, Sharpe ratio, beta, and volatility.",
            "input_schema" to mapOf(
                "type" to "object",
                "properties" to mapOf(
                    "scenario_id" to mapOf(
                        "type" to "string",
                        "description" to "The UUID of the scenario to run"
                    ),
                    "override_holdings" to mapOf(
                        "type" to "array",
                        "description" to "Optional: use a different portfolio composition instead of the user's current one",
                        "items" to mapOf(
                            "type" to "object",
                            "properties" to mapOf(
                                "ticker" to mapOf("type" to "string"),
                                "weight" to mapOf("type" to "number", "description" to "Weight as percentage 0-100")
                            ),
                            "required" to listOf("ticker", "weight")
                        )
                    )
                ),
                "required" to listOf("scenario_id")
            )
        ),
        mapOf(
            "name" to "compare_all_scenarios",
            "description" to "Run the current portfolio through ALL available historical scenarios and return a ranked comparison by max drawdown.",
            "input_schema" to mapOf(
                "type" to "object",
                "properties" to emptyMap<String, Any>(),
                "required" to emptyList<String>()
            )
        )
    )

    // -------------------------------------------------------------------------
    // Tool execution
    // -------------------------------------------------------------------------
    private fun executeTool(
        name: String,
        input: Map<String, Any>,
        defaultHoldings: List<HoldingRequest>
    ): String {
        return when (name) {
            "list_scenarios" -> {
                val scenarios = scenarioRepository.findAll()
                mapper.writeValueAsString(scenarios.map {
                    mapOf(
                        "id" to it.id.toString(),
                        "name" to it.name,
                        "start_date" to it.startDate.toString(),
                        "end_date" to it.endDate.toString(),
                        "description" to it.description
                    )
                })
            }

            "run_simulation" -> {
                val scenarioId = UUID.fromString(input["scenario_id"] as String)

                @Suppress("UNCHECKED_CAST")
                val overrideHoldings = (input["override_holdings"] as? List<Map<String, Any>>)
                    ?.map { h ->
                        HoldingRequest(
                            ticker = h["ticker"] as String,
                            weight = BigDecimal(h["weight"].toString())
                        )
                    }

                val holdings = overrideHoldings ?: defaultHoldings
                val portfolio = buildTransientPortfolio(holdings)

                try {
                    val result = simulationService.simulate(portfolio, scenarioId)
                    mapper.writeValueAsString(
                        mapOf(
                            "max_drawdown_pct" to "%.1f%%".format(result.metrics.maxDrawdown.toDouble() * 100),
                            "worst_single_day_pct" to "%.1f%%".format(result.metrics.worstSingleDay.toDouble() * 100),
                            "recovery_days" to (result.metrics.recoveryDays ?: "not recovered within scenario window"),
                            "sharpe_ratio" to result.metrics.sharpeRatio,
                            "annualized_volatility_pct" to "%.1f%%".format(result.metrics.annualizedVolatility.toDouble() * 100),
                            "beta_vs_sp500" to result.metrics.beta,
                            "holdings_breakdown" to result.holdingsBreakdown.map {
                                mapOf(
                                    "ticker" to it.ticker,
                                    "weight_pct" to it.weight,
                                    "drawdown_pct" to "%.1f%%".format(it.drawdown.toDouble() * 100)
                                )
                            }
                        )
                    )
                } catch (e: Exception) {
                    mapper.writeValueAsString(mapOf("error" to (e.message ?: "Simulation failed")))
                }
            }

            "compare_all_scenarios" -> {
                val scenarios = scenarioRepository.findAll()
                val portfolio = buildTransientPortfolio(defaultHoldings)

                val results = scenarios.map { scenario ->
                    try {
                        val sim = simulationService.simulate(portfolio, scenario.id!!)
                        mapOf(
                            "scenario" to scenario.name,
                            "period" to "${scenario.startDate} to ${scenario.endDate}",
                            "max_drawdown_pct" to "%.1f%%".format(sim.metrics.maxDrawdown.toDouble() * 100),
                            "recovery_days" to (sim.metrics.recoveryDays ?: "not recovered"),
                            "sharpe_ratio" to sim.metrics.sharpeRatio.toString(),
                            "worst_day_pct" to "%.1f%%".format(sim.metrics.worstSingleDay.toDouble() * 100)
                        )
                    } catch (e: Exception) {
                        mapOf("scenario" to scenario.name, "error" to (e.message ?: "failed"))
                    }
                }.sortedBy {
                    // sort by max drawdown (worst first)
                    (it["max_drawdown_pct"] as? String)?.removeSuffix("%")?.toDoubleOrNull() ?: 0.0
                }

                mapper.writeValueAsString(results)
            }

            else -> mapper.writeValueAsString(mapOf("error" to "Unknown tool: $name"))
        }
    }

    private fun buildTransientPortfolio(holdings: List<HoldingRequest>): Portfolio {
        val portfolio = Portfolio(name = "agent-transient")
        holdings.forEach { h ->
            portfolio.holdings.add(
                Holding(portfolio = portfolio, ticker = h.ticker.uppercase(), weight = h.weight)
            )
        }
        return portfolio
    }

    private fun toolSummary(name: String, input: Map<String, Any>): String = when (name) {
        "list_scenarios" -> "Listed all available stress scenarios"
        "run_simulation" -> "Ran simulation against scenario ${input["scenario_id"]}"
        "compare_all_scenarios" -> "Compared portfolio across all historical scenarios"
        else -> name
    }

    // -------------------------------------------------------------------------
    // Claude API call
    // -------------------------------------------------------------------------
    private fun callClaude(
        system: String,
        messages: List<Map<String, Any>>,
        tools: List<Map<String, Any>>
    ): Map<*, *> {
        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
            set("x-api-key", apiKey)
            set("anthropic-version", "2023-06-01")
        }

        val body = mapOf(
            "model" to model,
            "max_tokens" to 4096,
            "system" to system,
            "tools" to tools,
            "messages" to messages
        )

        return restTemplate.postForObject(
            claudeUrl,
            HttpEntity(body, headers),
            Map::class.java
        ) ?: throw RuntimeException("No response from Claude API")
    }
}
