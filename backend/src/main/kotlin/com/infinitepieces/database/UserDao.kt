package com.infinitepieces.database

import com.infinitepieces.generated.tables.Users.Companion.USERS
import com.infinitepieces.model.domain.User
import org.jooq.DSLContext
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class UserDao(
  private val dsl: DSLContext,
) {
  private val domainSelect =
    listOf(
      USERS.USER_ID,
      USERS.EMAIL,
      USERS.FIREBASE_ID,
      USERS.FIRST_NAME,
      USERS.LAST_NAME,
    )

  fun selectByUserId(userId: UUID): User? =
    dsl
      .select(domainSelect)
      .from(USERS)
      .where(USERS.USER_ID.eq(userId))
      .and(USERS.DELETED_AT.isNull)
      .fetchOneInto(User::class.java)

  fun selectByEmail(email: String): User? =
    dsl
      .select(domainSelect)
      .from(USERS)
      .where(USERS.EMAIL.eq(email))
      .and(USERS.DELETED_AT.isNull)
      .fetchOneInto(User::class.java)

  fun updateName(userId: UUID, firstName: String?, lastName: String?): User? =
    dsl
      .update(USERS)
      .set(USERS.FIRST_NAME, firstName)
      .set(USERS.LAST_NAME, lastName)
      .where(USERS.USER_ID.eq(userId))
      .and(USERS.DELETED_AT.isNull)
      .returning(domainSelect)
      .fetchOneInto(User::class.java)
}
