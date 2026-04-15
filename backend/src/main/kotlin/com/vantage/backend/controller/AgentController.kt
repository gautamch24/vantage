package com.vantage.backend.controller

import com.vantage.backend.dto.AgentChatRequest
import com.vantage.backend.dto.AgentChatResponse
import com.vantage.backend.service.AgentService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/agent")
class AgentController(private val agentService: AgentService) {

    @PostMapping("/chat")
    fun chat(@Valid @RequestBody request: AgentChatRequest): AgentChatResponse =
        agentService.chat(request.holdings, request.message)
}
