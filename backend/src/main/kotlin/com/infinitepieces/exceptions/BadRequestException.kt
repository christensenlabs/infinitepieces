package com.infinitepieces.exceptions

import org.springframework.http.HttpStatus

class BadRequestException(
  override val message: String = "Bad Request",
) : HttpException(HttpStatus.BAD_REQUEST, message)
