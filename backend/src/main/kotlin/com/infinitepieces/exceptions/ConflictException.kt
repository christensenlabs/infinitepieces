package com.infinitepieces.exceptions

import org.springframework.http.HttpStatus

class ConflictException(
  override val message: String = "Conflict",
) : HttpException(HttpStatus.CONFLICT, message)
