package com.infinitepieces.database

import com.infinitepieces.generated.tables.Users.Companion.USERS
import com.infinitepieces.objects.User
import org.jooq.DSLContext
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class UsersDao(
  private val dsl: DSLContext,
) {
  private val domainSelect =
    listOf(
      USERS.USER_ID,
      USERS.EMAIL,
      USERS.FIREBASE_ID,
    )

  fun selectByUserId(userId: UUID): User? =
    dsl
      .select(domainSelect)
      .from(USERS)
      .where(USERS.USER_ID.eq(userId))
      .and(USERS.DELETED_AT.isNull)
      .fetchOneInto(User::class.java)
}
