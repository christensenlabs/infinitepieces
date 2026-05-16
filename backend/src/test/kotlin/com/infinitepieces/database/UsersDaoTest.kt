package com.infinitepieces.database

import com.infinitepieces.config.IntegrationTest
import com.infinitepieces.config.TestContainerConfig
import com.infinitepieces.config.TestSecurityConfig
import com.infinitepieces.generated.tables.Users.Companion.USERS
import org.jooq.DSLContext
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Import
import java.time.OffsetDateTime
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

@IntegrationTest
@Import(TestSecurityConfig::class, TestContainerConfig::class)
class UsersDaoTest
  @Autowired
  constructor(
    private val dsl: DSLContext,
    private val usersDao: UsersDao,
  ) {
    @BeforeEach
    fun cleanup() {
      dsl.deleteFrom(USERS).execute()
    }

    private fun insertUser(
      email: String,
      firebaseId: String? = null,
      deletedAt: OffsetDateTime? = null,
    ): UUID {
      val id = UUID.randomUUID()
      dsl
        .insertInto(USERS)
        .set(USERS.USER_ID, id)
        .set(USERS.EMAIL, email)
        .set(USERS.FIREBASE_ID, firebaseId)
        .set(USERS.DELETED_AT, deletedAt)
        .execute()
      return id
    }

    @Test
    fun `selectByUserId returns user when found`() {
      val id = insertUser("alice@example.com", "firebase-123")
      val user = usersDao.selectByUserId(id)

      assertNotNull(user)
      assertEquals(id, user.userId)
      assertEquals("alice@example.com", user.email)
      assertEquals("firebase-123", user.firebaseId)
    }

    @Test
    fun `selectByUserId returns null for nonexistent user`() {
      val user = usersDao.selectByUserId(UUID.randomUUID())

      assertNull(user)
    }

    @Test
    fun `selectByUserId excludes soft-deleted users`() {
      val id = insertUser("deleted@example.com", deletedAt = OffsetDateTime.now())
      val user = usersDao.selectByUserId(id)

      assertNull(user)
    }

    @Test
    fun `selectByUserId returns user with null firebaseId`() {
      val id = insertUser("nofirebase@example.com")
      val user = usersDao.selectByUserId(id)

      assertNotNull(user)
      assertNull(user.firebaseId)
    }
  }
