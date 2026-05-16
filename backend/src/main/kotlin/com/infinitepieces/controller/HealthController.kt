package com.infinitepieces.controller

import com.infinitepieces.model.api.v1.Health
import org.springframework.web.bind.annotation.GetMapping

@ApiController
class HealthController {
  @GetMapping("/health")
  fun health() = Health("up", "ok")

  @GetMapping("/hello")
  fun hello() = Health("Hello!", "World!")
}
