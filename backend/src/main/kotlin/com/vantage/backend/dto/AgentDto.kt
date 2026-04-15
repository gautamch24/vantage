package com.vantage.backend.dto

data class AgentChatRequest(
    val holdings: List<HoldingRequest>,
    val message: String
)

data class ToolCallRecord(
    val tool: String,
    val summary: String
)

data class AgentChatResponse(
    val content: String,
    val toolCallsMade: List<ToolCallRecord>
)
