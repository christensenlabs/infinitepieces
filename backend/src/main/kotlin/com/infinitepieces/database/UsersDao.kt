package com.infinitepieces.database

import com.infinitepieces.objects.User
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.RecordMapper
import org.jooq.impl.DSL.field
import org.jooq.impl.DSL.table
import org.springframework.stereotype.Repository
import java.util.UUID

private val userMapper =
  RecordMapper<Record, User> { record ->
    User(
      userId = record.get("user_id", UUID::class.java)!!,
      email = record.get("email", String::class.java)!!,
      firebaseId = record.get("firebase_id", String::class.java),
    )
  }

@Repository
class UsersDao(
  private val dsl: DSLContext,
) {
  fun findById(userId: UUID): User? =
    dsl
      .selectFrom(table("users"))
      .where(field("user_id").eq(userId))
      .and(field("deleted_at").isNull)
      .fetchOne(userMapper)
}
