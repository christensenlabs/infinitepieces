package com.infinitepieces.exception

import org.springframework.http.HttpStatus

class UnauthorizedException(
  override val message: String = "User Unauthorized",
) : HttpException(HttpStatus.UNAUTHORIZED, message)
