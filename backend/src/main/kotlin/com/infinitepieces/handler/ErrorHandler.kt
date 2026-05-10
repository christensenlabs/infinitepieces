package com.infinitepieces.handler

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.servlet.NoHandlerFoundException
import org.springframework.web.servlet.resource.NoResourceFoundException

@ControllerAdvice
class ErrorHandler {

    @ExceptionHandler(NoHandlerFoundException::class, NoResourceFoundException::class)
    fun handleNotFound(ex: Exception): ResponseEntity<Map<String, Any>> =
        ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(mapOf("status" to 404, "message" to "Not Found"))

    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    fun handleBadRequest(ex: Exception): ResponseEntity<Map<String, Any>> =
        ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(mapOf("status" to 400, "message" to "Bad Request"))

    @ExceptionHandler(Exception::class)
    fun handleAll(ex: Exception): ResponseEntity<Map<String, Any>> =
        ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(mapOf("status" to 500, "message" to "Internal Server Error"))
}
