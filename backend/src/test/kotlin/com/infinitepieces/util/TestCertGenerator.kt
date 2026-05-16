package com.infinitepieces.util

import java.security.KeyPair
import java.security.Signature
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate
import java.text.SimpleDateFormat
import java.util.Base64
import java.util.Date
import java.util.TimeZone

/**
 * Generates self-signed X.509 certificates for tests using raw ASN.1 DER
 * encoding. No Bouncy Castle or sun.security.x509 internal APIs required —
 * works on modular Java 21+.
 */
object TestCertGenerator {
  fun createSelfSignedCert(keyPair: KeyPair): X509Certificate {
    val now = Date()
    val until = Date(now.time + 86_400_000)
    val issuerBytes = encodeDN("CN=Test")

    val tbs =
      buildTbsCertificate(
        serialNumber = byteArrayOf(1),
        algorithmOid = SHA256_WITH_RSA_OID,
        issuer = issuerBytes,
        notBefore = now,
        notAfter = until,
        subject = issuerBytes,
        publicKeyInfo = keyPair.public.encoded,
      )

    val sig = Signature.getInstance("SHA256withRSA")
    sig.initSign(keyPair.private)
    sig.update(tbs)
    val signatureBytes = sig.sign()

    val algId = derSequence(derOid(SHA256_WITH_RSA_OID), derNull())
    val certDer = derSequence(tbs, algId, derBitString(signatureBytes))

    val cf = CertificateFactory.getInstance("X.509")
    return cf.generateCertificate(certDer.inputStream()) as X509Certificate
  }

  fun toPem(cert: X509Certificate): String {
    val encoder = Base64.getMimeEncoder(64, "\n".toByteArray())
    return "-----BEGIN CERTIFICATE-----\n${encoder.encodeToString(cert.encoded)}\n-----END CERTIFICATE-----"
  }

  // sha256WithRSAEncryption OID: 1.2.840.113549.1.1.11
  private val SHA256_WITH_RSA_OID =
    byteArrayOf(0x2A, 0x86.toByte(), 0x48, 0x86.toByte(), 0xF7.toByte(), 0x0D, 0x01, 0x01, 0x0B)

  // id-at-commonName OID: 2.5.4.3
  private val CN_OID = byteArrayOf(0x55, 0x04, 0x03)

  // --- ASN.1 DER encoding ---

  private fun buildTbsCertificate(
    serialNumber: ByteArray,
    algorithmOid: ByteArray,
    issuer: ByteArray,
    notBefore: Date,
    notAfter: Date,
    subject: ByteArray,
    publicKeyInfo: ByteArray,
  ): ByteArray {
    val version = derExplicit(0, derInteger(byteArrayOf(2))) // v3
    val serial = derInteger(serialNumber)
    val algId = derSequence(derOid(algorithmOid), derNull())
    val validity = derSequence(derUtcTime(notBefore), derUtcTime(notAfter))
    return derSequence(version, serial, algId, issuer, validity, subject, publicKeyInfo)
  }

  private fun encodeDN(dn: String): ByteArray {
    val cn = dn.removePrefix("CN=")
    val atv = derSequence(derOid(CN_OID), derUtf8String(cn))
    return derSequence(derSet(atv))
  }

  private fun derTag(tag: Int, content: ByteArray): ByteArray =
    byteArrayOf(tag.toByte()) + derLength(content.size) + content

  private fun derSequence(vararg elements: ByteArray) = derTag(0x30, elements.reduce { a, b -> a + b })

  private fun derSet(vararg elements: ByteArray) = derTag(0x31, elements.reduce { a, b -> a + b })

  private fun derInteger(value: ByteArray) = derTag(0x02, if (value[0].toInt() and 0x80 != 0) byteArrayOf(0) + value else value)

  private fun derOid(oid: ByteArray) = derTag(0x06, oid)

  private fun derNull() = byteArrayOf(0x05, 0x00)

  private fun derUtf8String(s: String) = derTag(0x0C, s.toByteArray(Charsets.UTF_8))

  private fun derBitString(data: ByteArray) = derTag(0x03, byteArrayOf(0x00) + data)

  private fun derExplicit(tag: Int, content: ByteArray) = derTag(0xA0 + tag, content)

  private fun derUtcTime(date: Date): ByteArray {
    val fmt = SimpleDateFormat("yyMMddHHmmss'Z'").apply { timeZone = TimeZone.getTimeZone("UTC") }
    return derTag(0x17, fmt.format(date).toByteArray(Charsets.US_ASCII))
  }

  private fun derLength(len: Int): ByteArray {
    if (len < 128) return byteArrayOf(len.toByte())
    val bytes = mutableListOf<Byte>()
    var remaining = len
    while (remaining > 0) {
      bytes.add(0, (remaining and 0xFF).toByte())
      remaining = remaining shr 8
    }
    return byteArrayOf((0x80 or bytes.size).toByte()) + bytes.toByteArray()
  }
}
