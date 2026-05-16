package com.infinitepieces.filter

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthException
import com.infinitepieces.objects.FirebaseUser
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class FirebaseAuthFilter(
  private val firebaseAuth: FirebaseAuth?,
) : OncePerRequestFilter() {
  override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
    val header = request.getHeader("Authorization")
    if (header != null && header.startsWith("Bearer ") && firebaseAuth != null) {
      val token = header.substring(7)
      try {
        val decoded = firebaseAuth.verifyIdToken(token)
        val user = FirebaseUser(uid = decoded.uid, email = decoded.email)
        SecurityContextHolder.getContext().authentication = user
      } catch (e: FirebaseAuthException) {
        SecurityContextHolder.clearContext()
      }
    }
    filterChain.doFilter(request, response)
  }
}
