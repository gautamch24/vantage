package com.vantage.backend.client

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder
import java.math.BigDecimal
import java.time.LocalDate

data class PricePoint(
    val date: LocalDate,
    val close: BigDecimal
)

data class PricesResponse(
    val ticker: String,
    val prices: List<PricePoint>
)

data class ValidateResponse(
    val ticker: String,
    val valid: Boolean,
    val existsDuringPeriod: Boolean
)

@Component
class DataServiceClient(
    private val restTemplate: RestTemplate,
    @Value("\${data-service.base-url}") private val baseUrl: String
) {
    fun getPrices(ticker: String, startDate: LocalDate, endDate: LocalDate): PricesResponse {
        val url = UriComponentsBuilder.fromUriString("$baseUrl/data/prices")
            .queryParam("ticker", ticker)
            .queryParam("start", startDate)
            .queryParam("end", endDate)
            .toUriString()

        return restTemplate.getForObject(url, PricesResponse::class.java)
            ?: throw RuntimeException("No price data returned for $ticker")
    }

    fun validateTicker(ticker: String, startDate: LocalDate, endDate: LocalDate): ValidateResponse {
        val url = UriComponentsBuilder.fromUriString("$baseUrl/data/validate")
            .queryParam("ticker", ticker)
            .queryParam("start", startDate)
            .queryParam("end", endDate)
            .toUriString()

        return restTemplate.getForObject(url, ValidateResponse::class.java)
            ?: throw RuntimeException("Validation failed for $ticker")
    }
}
