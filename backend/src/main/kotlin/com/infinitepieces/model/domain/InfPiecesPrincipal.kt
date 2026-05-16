package com.infinitepieces.model.domain

import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder

data class InfPiecesPrincipal(
  val provider: FirebaseUser,
  val user: User,
) : Authentication {
  companion object {
    fun current(): InfPiecesPrincipal =
      SecurityContextHolder.getContext().authentication as InfPiecesPrincipal
  }

  private var authenticated = true

  override fun getName(): String = provider.email

  override fun getAuthorities(): Collection<GrantedAuthority> = emptyList()

  override fun getCredentials(): Any? = null

  override fun getDetails(): Any? = null

  override fun getPrincipal(): InfPiecesPrincipal = this

  override fun isAuthenticated(): Boolean = authenticated

  override fun setAuthenticated(isAuthenticated: Boolean) {
    authenticated = isAuthenticated
  }
}
