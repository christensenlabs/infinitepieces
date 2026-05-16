package com.infinitepieces.filter

import com.fasterxml.jackson.databind.ObjectMapper
import com.infinitepieces.config.InfinitePiecesProps
import com.infinitepieces.objects.FirebaseUser
import com.infinitepieces.util.TestCertGenerator
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import java.security.KeyPairGenerator
import java.security.Signature
import java.security.interfaces.RSAPrivateKey
import java.util.Base64
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class FirebaseAuthFilterTest {
  private val objectMapper = ObjectMapper()
  private val projectId = "infinite-pieces"
  private val kid = "test-key-1"
  private lateinit var mockServer: MockWebServer
  private lateinit var filter: FirebaseAuthFilter
  private lateinit var privateKey: RSAPrivateKey
  private lateinit var certPem: String

  @BeforeEach
  fun setup() {
    SecurityContextHolder.clearContext()

    val keyPair = KeyPairGenerator.getInstance("RSA").apply { initialize(2048) }.generateKeyPair()
    privateKey = keyPair.private as RSAPrivateKey
    val cert = TestCertGenerator.createSelfSignedCert(keyPair)
    certPem = TestCertGenerator.toPem(cert)

    mockServer = MockWebServer()
    mockServer.start()

    val props =
      InfinitePiecesProps(
        firebase =
          InfinitePiecesProps.FirebaseProps(
            projectId = projectId,
            googleCertsUrl = mockServer.url("/certs").toString(),
          ),
      )
    filter = FirebaseAuthFilter(firebaseAuth = null, objectMapper = objectMapper, props = props)
  }

  @AfterEach
  fun teardown() {
    SecurityContextHolder.clearContext()
    mockServer.shutdown()
  }

  @Test
  fun `valid token authenticates user`() {
    enqueueCerts()
    doFilter(buildToken())

    val user = authenticatedUser()
    assertNotNull(user)
    assertEquals("user-123", user.uid)
    assertEquals("alice@example.com", user.email)
  }

  @Test
  fun `expired token is rejected`() {
    enqueueCerts()
    doFilter(buildToken(exp = pastTimestamp()))
    assertNull(SecurityContextHolder.getContext().authentication)
  }

  @Test
  fun `token issued in the future is rejected`() {
    enqueueCerts()
    doFilter(buildToken(iat = futureTimestamp()))
    assertNull(SecurityContextHolder.getContext().authentication)
  }

  @Test
  fun `wrong issuer is rejected`() {
    enqueueCerts()
    doFilter(buildToken(iss = "https://securetoken.google.com/wrong-project"))
    assertNull(SecurityContextHolder.getContext().authentication)
  }

  @Test
  fun `wrong audience is rejected`() {
    enqueueCerts()
    doFilter(buildToken(aud = "wrong-project"))
    assertNull(SecurityContextHolder.getContext().authentication)
  }

  @Test
  fun `unverified email is rejected`() {
    enqueueCerts()
    doFilter(buildToken(emailVerified = false))
    assertNull(SecurityContextHolder.getContext().authentication)
  }

  @Test
  fun `missing sub is rejected`() {
    enqueueCerts()
    doFilter(buildToken(sub = ""))
    assertNull(SecurityContextHolder.getContext().authentication)
  }

  @Test
  fun `wrong algorithm is rejected`() {
    enqueueCerts()
    doFilter(buildToken(alg = "HS256"))
    assertNull(SecurityContextHolder.getContext().authentication)
  }

  @Test
  fun `tampered payload is rejected`() {
    enqueueCerts()
    val token = buildToken()
    val parts = token.split(".")
    val tamperedPayload = parts[1].reversed()
    doFilter("${parts[0]}.$tamperedPayload.${parts[2]}")
    assertNull(SecurityContextHolder.getContext().authentication)
  }

  @Test
  fun `unknown key ID is rejected`() {
    enqueueCerts()
    doFilter(buildToken(kid = "unknown-kid"))
    assertNull(SecurityContextHolder.getContext().authentication)
  }

  @Test
  fun `request without auth header passes through unauthenticated`() {
    val request = MockHttpServletRequest()
    val response = MockHttpServletResponse()
    var chainCalled = false
    filter.doFilter(request, response) { _, _ -> chainCalled = true }
    assertTrue(chainCalled)
    assertNull(SecurityContextHolder.getContext().authentication)
  }

  @Test
  fun `malformed token is rejected`() {
    doFilter("not-a-jwt")
    assertNull(SecurityContextHolder.getContext().authentication)
  }

  // --- helpers ---

  private fun authenticatedUser(): FirebaseUser? =
    (SecurityContextHolder.getContext().authentication?.principal as? FirebaseUser)

  private fun doFilter(token: String) {
    val request = MockHttpServletRequest()
    request.addHeader("Authorization", "Bearer $token")
    val response = MockHttpServletResponse()
    filter.doFilter(request, response) { _, _ -> }
  }

  private fun enqueueCerts() {
    val certsJson = objectMapper.writeValueAsString(mapOf(kid to certPem))
    mockServer.enqueue(MockResponse().setBody(certsJson))
  }

  private fun nowTimestamp() = System.currentTimeMillis() / 1000

  private fun futureTimestamp() = nowTimestamp() + 3600

  private fun pastTimestamp() = nowTimestamp() - 3600

  private fun buildToken(
    sub: String = "user-123",
    email: String = "alice@example.com",
    emailVerified: Boolean = true,
    iss: String = "https://securetoken.google.com/$projectId",
    aud: String = projectId,
    iat: Long = nowTimestamp(),
    exp: Long = futureTimestamp(),
    alg: String = "RS256",
    kid: String = this.kid,
  ): String {
    val encoder = Base64.getUrlEncoder().withoutPadding()
    val header =
      encoder.encodeToString(
        objectMapper.writeValueAsBytes(mapOf("alg" to alg, "kid" to kid, "typ" to "JWT")),
      )
    val payload =
      encoder.encodeToString(
        objectMapper.writeValueAsBytes(
          mapOf(
            "sub" to sub,
            "email" to email,
            "email_verified" to emailVerified,
            "iss" to iss,
            "aud" to aud,
            "iat" to iat,
            "exp" to exp,
          ),
        ),
      )
    val signedData = "$header.$payload".toByteArray(Charsets.US_ASCII)
    val sig = Signature.getInstance("SHA256withRSA")
    sig.initSign(privateKey)
    sig.update(signedData)
    val signature = encoder.encodeToString(sig.sign())
    return "$header.$payload.$signature"
  }
}
