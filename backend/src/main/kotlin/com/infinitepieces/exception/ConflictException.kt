package com.infinitepieces.exception

import org.springframework.http.HttpStatus

class ConflictException(
  override val message: String = "Conflict",
) : HttpException(HttpStatus.CONFLICT, message)
