package com.infinitepieces.filter

import com.fasterxml.jackson.databind.ObjectMapper
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthException
import com.infinitepieces.config.InfinitePiecesProps
import com.infinitepieces.model.domain.FirebaseUser
import com.infinitepieces.model.domain.InfPiecesPrincipal
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.net.URI
import java.security.PublicKey
import java.security.Signature
import java.security.cert.CertificateFactory
import java.util.Base64
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicLong

/**
 * Authenticates incoming requests by verifying Firebase ID tokens from the
 * Authorization header.
 *
 * ## Verification strategies
 *
 * **Admin SDK (preferred):** When Firebase credentials are available
 * (GOOGLE_APPLICATION_CREDENTIALS), the filter delegates to
 * [FirebaseAuth.verifyIdToken], which handles key fetching, caching, and
 * all claim validation internally.
 *
 * **Manual verification (fallback):** When no credentials are available,
 * the filter verifies tokens directly. This is secure because:
 *
 * 1. Firebase signs every ID token with a private RSA key that only Google
 *    controls.
 * 2. Google publishes the corresponding public keys at a well-known HTTPS
 *    endpoint (the Google certs URL in config). These rotate periodically.
 * 3. We verify the token's RSA signature against Google's public key. A
 *    valid signature proves the token was created by Google and has not
 *    been tampered with — no one else possesses the private key.
 * 4. We additionally validate standard JWT claims (issuer, audience,
 *    expiration) to ensure the token was issued for our project and hasn't
 *    expired.
 *
 * This is the same trust model used by any OAuth2/OIDC resource server —
 * asymmetric cryptography means the verifier never needs the signing secret.
 */
@Component
class FirebaseAuthFilter(
  private val firebaseAuth: FirebaseAuth?,
  private val objectMapper: ObjectMapper,
  private val props: InfinitePiecesProps,
  private val userDao: com.infinitepieces.database.UserDao,
) : OncePerRequestFilter() {
  private val log = LoggerFactory.getLogger(FirebaseAuthFilter::class.java)

  // Google rotates certs periodically. Re-fetch at most once per hour to
  // avoid hammering the endpoint while still picking up rotations promptly.
  private val certCache = ConcurrentHashMap<String, PublicKey>()
  private val certCacheExpiry = AtomicLong(0)

  override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
    val token = extractToken(request)
    if (token != null) {
      val firebaseUser = if (firebaseAuth != null) verifyWithAdminSdk(token) else verifyManually(token)
      if (firebaseUser == null) {
        writeJsonError(response, 401, "Unauthorized")
        return
      }
      val dbUser = userDao.selectByEmail(firebaseUser.email)
      if (dbUser == null) {
        // Valid Firebase token but no user in our database
        writeJsonError(response, 403, "User Forbidden")
        return
      }
      SecurityContextHolder.getContext().authentication = InfPiecesPrincipal(provider = firebaseUser, user = dbUser)
    }
    filterChain.doFilter(request, response)
  }

  private fun writeJsonError(response: HttpServletResponse, status: Int, message: String) {
    response.status = status
    response.contentType = "application/json"
    objectMapper.writeValue(response.outputStream, mapOf("status" to status, "message" to message))
  }

  private fun verifyWithAdminSdk(token: String): FirebaseUser? {
    return try {
      val decoded = firebaseAuth!!.verifyIdToken(token)
      if (decoded.isEmailVerified != true) return null
      FirebaseUser(uid = decoded.uid, email = decoded.email)
    } catch (e: FirebaseAuthException) {
      log.warn("Admin SDK verification failed: {}", e.message)
      null
    }
  }

  private fun verifyManually(token: String): FirebaseUser? {
    try {
      val parts = token.split(".")
      if (parts.size != 3) return null

      val decoder = Base64.getUrlDecoder()
      val header = objectMapper.readTree(decoder.decode(parts[0]))
      val payload = objectMapper.readTree(decoder.decode(parts[1]))

      val projectId = props.firebase.projectId
      val iss = payload.get("iss")?.asText()
      val aud = payload.get("aud")?.asText()
      val exp = payload.get("exp")?.asLong() ?: 0
      val iat = payload.get("iat")?.asLong() ?: 0
      val sub = payload.get("sub")?.asText()
      val now = System.currentTimeMillis() / 1000

      // Validate standard Firebase token claims
      if (iss != "https://securetoken.google.com/$projectId") return null
      if (aud != projectId) return null
      if (exp < now) return null
      if (iat > now) return null // issued in the future
      if (sub.isNullOrEmpty()) return null

      // Verify the RSA signature using Google's published public key
      val kid = header.get("kid")?.asText() ?: return null
      val alg = header.get("alg")?.asText()
      if (alg != "RS256") return null

      val publicKey = getGoogleCert(kid) ?: return null
      val signedData = "${parts[0]}.${parts[1]}".toByteArray(Charsets.US_ASCII)
      val signatureBytes = decoder.decode(parts[2])

      val sig = Signature.getInstance("SHA256withRSA")
      sig.initVerify(publicKey)
      sig.update(signedData)
      if (!sig.verify(signatureBytes)) return null

      // Only trust emails that the provider has verified
      val emailVerified = payload.get("email_verified")?.asBoolean() ?: false
      if (!emailVerified) return null

      val email = payload.get("email")?.asText() ?: return null

      return FirebaseUser(uid = sub, email = email)
    } catch (e: Exception) {
      log.warn("Manual JWT verification failed: {}", e.message)
      return null
    }
  }

  /**
   * Fetches and caches Google's public X.509 certificates. The cache is
   * refreshed when a key ID is not found or the TTL has expired, handling
   * Google's periodic key rotation.
   */
  private fun getGoogleCert(kid: String): PublicKey? {
    val now = System.currentTimeMillis()
    if (now < certCacheExpiry.get()) {
      certCache[kid]?.let { return it }
    }
    return refreshCerts(kid)
  }

  @Synchronized
  private fun refreshCerts(kid: String): PublicKey? {
    // Double-check after acquiring lock
    val now = System.currentTimeMillis()
    if (now < certCacheExpiry.get() && certCache.containsKey(kid)) {
      return certCache[kid]
    }
    return try {
      val json = URI(props.firebase.googleCertsUrl).toURL().readText()
      val certs = objectMapper.readTree(json)
      val certFactory = CertificateFactory.getInstance("X.509")
      certCache.clear()
      certs.fields().forEach { (key, value) ->
        val cert = certFactory.generateCertificate(value.asText().byteInputStream())
        certCache[key] = cert.publicKey
      }
      certCacheExpiry.set(now + CERT_CACHE_MILLIS)
      certCache[kid]
    } catch (e: Exception) {
      log.warn("Failed to fetch Google certs: {}", e.message)
      null
    }
  }

  private fun extractToken(request: HttpServletRequest): String? {
    val header = request.getHeader("Authorization")
    if (header != null && header.startsWith("Bearer ")) {
      return header.substring(7)
    }
    return request.cookies?.firstOrNull { it.name == AUTH_COOKIE }?.value
  }

  companion object {
    const val AUTH_COOKIE = "SESSION"
    private const val CERT_CACHE_MILLIS = 60 * 60 * 1000 // 1 hour
  }
}
