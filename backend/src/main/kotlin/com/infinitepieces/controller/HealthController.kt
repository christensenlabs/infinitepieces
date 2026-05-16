package com.infinitepieces.controller

import org.springframework.web.bind.annotation.GetMapping

@ApiController
class HealthController {
    @GetMapping("/health")
    fun health(): Map<String, String> = mapOf("status" to "ok")

    @GetMapping("/hello")
    fun hello(): Map<String, String> = mapOf("message" to "Hello, World!")
}
