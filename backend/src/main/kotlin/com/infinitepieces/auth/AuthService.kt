package com.infinitepieces.auth

import com.infinitepieces.model.domain.InfPiecesPrincipal
import org.springframework.stereotype.Component
import java.util.UUID

@Component("Auth")
class AuthService {
  fun principal(): InfPiecesPrincipal = InfPiecesPrincipal.current()

  fun isSelf(userId: UUID): Boolean =
    InfPiecesPrincipal.current().user.userId == userId
}
