package com.infinitepieces.exception

import org.springframework.http.HttpStatus

class NotFoundException(
  override val message: String = "Not Found",
) : HttpException(HttpStatus.NOT_FOUND, message)
