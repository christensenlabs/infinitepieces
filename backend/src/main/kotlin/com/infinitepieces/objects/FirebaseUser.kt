package com.infinitepieces.objects

import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority

data class FirebaseUser(
  val uid: String,
  val email: String?,
) : Authentication {
  private var authenticated = true

  override fun getName(): String = uid

  override fun getAuthorities(): Collection<GrantedAuthority> = emptyList()

  override fun getCredentials(): Any? = null

  override fun getDetails(): Any? = null

  override fun getPrincipal(): FirebaseUser = this

  override fun isAuthenticated(): Boolean = authenticated

  override fun setAuthenticated(isAuthenticated: Boolean) {
    authenticated = isAuthenticated
  }
}
