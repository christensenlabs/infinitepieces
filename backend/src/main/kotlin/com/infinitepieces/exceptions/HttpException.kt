package com.infinitepieces.exceptions

import org.springframework.http.HttpStatus

open class HttpException(
  val status: HttpStatus,
  override val message: String,
) : RuntimeException(message)
