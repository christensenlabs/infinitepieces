package com.infinitepieces.controller

import com.infinitepieces.database.UsersDao
import com.infinitepieces.exceptions.NotFoundException
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import java.util.UUID

@ApiController
@RequestMapping("/users")
class UsersController(
  private val usersDao: UsersDao,
) {
  @GetMapping("/{id}")
  fun getUser(@PathVariable id: UUID): ResponseEntity<Any> {
    val user = usersDao.selectByUserId(id) ?: throw NotFoundException("User $id not found")
    return ResponseEntity.ok(user)
  }
}
