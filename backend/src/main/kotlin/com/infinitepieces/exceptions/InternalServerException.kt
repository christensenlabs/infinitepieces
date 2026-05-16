package com.infinitepieces.exceptions

import org.springframework.http.HttpStatus

class InternalServerException(
  override val message: String = "Internal Server Error",
) : HttpException(HttpStatus.INTERNAL_SERVER_ERROR, message)
