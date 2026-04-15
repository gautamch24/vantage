package com.vantage.backend.service

import com.vantage.backend.dto.MetricsDto
import com.vantage.backend.dto.NarrativeResponse
import com.vantage.backend.model.Scenario
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType

@Service
class NarrativeService(
    private val restTemplate: RestTemplate,
    @Value("\${anthropic.api-key}") private val apiKey: String
) {

    private val claudeUrl = "https://api.anthropic.com/v1/messages"
    private val model = "claude-sonnet-4-6"

    fun generateNarrative(
        portfolioSummary: String,
        scenario: Scenario,
        metrics: MetricsDto
    ): NarrativeResponse {
        val prompt = buildPrompt(portfolioSummary, scenario, metrics)
        val narrative = callClaude(prompt)
        return NarrativeResponse(narrative = narrative)
    }

    private fun buildPrompt(
        portfolioSummary: String,
        scenario: Scenario,
        metrics: MetricsDto
    ): String {
        val recoveryText = metrics.recoveryDays?.let { "$it days" } ?: "did not recover within the scenario window"

        return """
            You are a senior wealth management analyst at Goldman Sachs explaining stress test results to a client.

            Portfolio: $portfolioSummary
            Stress Scenario: ${scenario.name} (${scenario.startDate} to ${scenario.endDate})
            Crisis Context: ${scenario.crisisSummary}

            Simulation Results:
            - Max Drawdown: ${(metrics.maxDrawdown.toDouble() * 100).format(1)}%
            - Worst Single Day: ${(metrics.worstSingleDay.toDouble() * 100).format(1)}%
            - Recovery Time: $recoveryText
            - Sharpe Ratio: ${metrics.sharpeRatio}
            - Annualized Volatility: ${(metrics.annualizedVolatility.toDouble() * 100).format(1)}%
            - Beta vs S&P 500: ${metrics.beta}

            Write a 3-4 paragraph plain-English explanation covering:
            1. What caused this crisis and why it affected this specific portfolio
            2. What the max drawdown and recovery time mean in practical terms for the client
            3. What the Sharpe ratio and beta reveal about the portfolio's risk profile
            4. What this tells us about the portfolio's diversification and what changes could reduce risk

            Speak directly to the client. Be specific to their holdings, not generic. Keep it clear and jargon-free.
        """.trimIndent()
    }

    private fun callClaude(prompt: String): String {
        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
            set("x-api-key", apiKey)
            set("anthropic-version", "2023-06-01")
        }

        val body = mapOf(
            "model" to model,
            "max_tokens" to 1024,
            "messages" to listOf(
                mapOf("role" to "user", "content" to prompt)
            )
        )

        val response = restTemplate.postForObject(
            claudeUrl,
            HttpEntity(body, headers),
            Map::class.java
        ) ?: throw RuntimeException("No response from Claude API")

        @Suppress("UNCHECKED_CAST")
        val content = (response["content"] as List<Map<String, Any>>).first()
        return content["text"] as String
    }

    private fun Double.format(decimals: Int) = "%.${decimals}f".format(this)
}
