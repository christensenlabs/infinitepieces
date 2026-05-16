package com.infinitepieces.controller

import com.infinitepieces.database.UserDao
import com.infinitepieces.exception.NotFoundException
import com.infinitepieces.model.api.v1.UpdateNameRequest
import com.infinitepieces.model.api.v1.User
import com.infinitepieces.model.domain.InfPiecesPrincipal
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import java.util.UUID

@ApiController
@RequestMapping("/users")
class UsersController(
  private val userDao: UserDao,
) {
  @GetMapping("/self")
  fun getSelf(): User = InfPiecesPrincipal.current().user.toModelV1()

  @GetMapping("/{id}")
  fun getUser(@PathVariable id: UUID): ResponseEntity<Any> {
    val user = userDao.selectByUserId(id) ?: throw NotFoundException("User $id not found")
    return ResponseEntity.ok(user)
  }

  @PutMapping("/{id}/name")
  @PreAuthorize("@Auth.isSelf(#id)")
  fun updateName(@PathVariable id: UUID, @RequestBody request: UpdateNameRequest): User {
    val user =
      userDao.updateName(id, request.firstName, request.lastName)
        ?: throw NotFoundException("User $id not found")
    return user.toModelV1()
  }
}
