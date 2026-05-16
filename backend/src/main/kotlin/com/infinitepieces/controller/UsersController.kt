package com.infinitepieces.controller

import com.infinitepieces.database.UsersDao
import com.infinitepieces.exception.NotFoundException
import com.infinitepieces.model.domain.InfPiecesPrincipal
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import java.util.UUID

@ApiController
@RequestMapping("/users")
class UsersController(
  private val usersDao: UsersDao,
) {
  @GetMapping("/self")
  fun getSelf(@AuthenticationPrincipal principal: InfPiecesPrincipal): ResponseEntity<Any> {
    val user = principal.user ?: throw NotFoundException("User not found")
    return ResponseEntity.ok(user)
  }

  @GetMapping("/{id}")
  fun getUser(@PathVariable id: UUID): ResponseEntity<Any> {
    val user = usersDao.selectByUserId(id) ?: throw NotFoundException("User $id not found")
    return ResponseEntity.ok(user)
  }
}
