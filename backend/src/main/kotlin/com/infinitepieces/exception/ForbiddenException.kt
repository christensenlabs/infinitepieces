package com.infinitepieces.exception

import org.springframework.http.HttpStatus

class ForbiddenException(
  override val message: String = "User forbidden",
) : HttpException(HttpStatus.FORBIDDEN, message)
