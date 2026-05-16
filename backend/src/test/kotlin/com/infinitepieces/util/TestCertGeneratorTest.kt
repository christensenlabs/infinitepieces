package com.infinitepieces.util

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.security.KeyPairGenerator
import java.security.Signature
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate
import java.security.interfaces.RSAPublicKey
import java.util.Date
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class TestCertGeneratorTest {
  private lateinit var keyPair: java.security.KeyPair
  private lateinit var cert: X509Certificate

  @BeforeEach
  fun setup() {
    keyPair = KeyPairGenerator.getInstance("RSA").apply { initialize(2048) }.generateKeyPair()
    cert = TestCertGenerator.createSelfSignedCert(keyPair)
  }

  @Test
  fun `cert contains the correct public key`() {
    assertEquals(keyPair.public, cert.publicKey)
  }

  @Test
  fun `cert uses RSA public key`() {
    assertTrue(cert.publicKey is RSAPublicKey)
  }

  @Test
  fun `cert is self-signed and verifies against its own public key`() {
    cert.verify(keyPair.public)
  }

  @Test
  fun `cert uses SHA256withRSA signature algorithm`() {
    assertEquals("SHA256withRSA", cert.sigAlgName)
  }

  @Test
  fun `cert is currently valid`() {
    cert.checkValidity(Date())
  }

  @Test
  fun `cert subject is CN=Test`() {
    assertEquals("CN=Test", cert.subjectX500Principal.name)
  }

  @Test
  fun `cert issuer matches subject`() {
    assertEquals(cert.subjectX500Principal, cert.issuerX500Principal)
  }

  @Test
  fun `cert is version 3`() {
    assertEquals(3, cert.version)
  }

  @Test
  fun `toPem produces valid PEM that can be parsed back`() {
    val pem = TestCertGenerator.toPem(cert)
    assertTrue(pem.startsWith("-----BEGIN CERTIFICATE-----"))
    assertTrue(pem.endsWith("-----END CERTIFICATE-----"))

    val cf = CertificateFactory.getInstance("X.509")
    val parsed = cf.generateCertificate(pem.byteInputStream()) as X509Certificate
    assertEquals(cert, parsed)
  }

  @Test
  fun `cert signature is valid for arbitrary data`() {
    val data = "test data to sign".toByteArray()
    val sig = Signature.getInstance("SHA256withRSA")
    sig.initSign(keyPair.private)
    sig.update(data)
    val signed = sig.sign()

    val verify = Signature.getInstance("SHA256withRSA")
    verify.initVerify(cert.publicKey)
    verify.update(data)
    assertTrue(verify.verify(signed))
  }

  @Test
  fun `different key pairs produce different certs`() {
    val otherKeyPair = KeyPairGenerator.getInstance("RSA").apply { initialize(2048) }.generateKeyPair()
    val otherCert = TestCertGenerator.createSelfSignedCert(otherKeyPair)
    assertTrue(cert.encoded.contentEquals(otherCert.encoded).not())
  }
}
