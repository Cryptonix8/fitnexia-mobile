package com.fitnexia.app

import android.content.Context
import android.util.Log
import com.facebook.react.modules.network.OkHttpClientProvider
import java.security.KeyStore
import java.security.cert.CertificateException
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate
import javax.net.ssl.HostnameVerifier
import javax.net.ssl.HttpsURLConnection
import javax.net.ssl.SSLContext
import javax.net.ssl.SSLSession
import javax.net.ssl.TrustManagerFactory
import javax.net.ssl.X509TrustManager

/**
 * Android rejects the VPS HTTPS endpoint (`https://46.183.25.232:46000`) that iOS
 * accepts. Two platform gaps are involved:
 *
 * 1. Let's Encrypt Generation Y (Root YE / YE1-YE3) is not in Android's system
 *    trust store yet, so path building through YE2 fails.
 * 2. Hostname verification against an IP SAN is stricter on Android than iOS,
 *    especially when the leaf subject is empty.
 *
 * This installs extra public Let's Encrypt CAs and an IP-aware hostname verifier
 * on the OkHttp client used by React Native `fetch`.
 */
object ApiTls {
  private const val TAG = "FitnexiaTls"
  private val IPV4 = Regex("""^\d{1,3}(?:\.\d{1,3}){3}$""")
  private val EXTRA_CA_RES_IDS =
    intArrayOf(
      R.raw.isrg_root_ye,
      R.raw.isrg_ye1,
      R.raw.isrg_ye2,
      R.raw.isrg_ye3,
    )

  @JvmStatic
  fun install(context: Context) {
    val appContext = context.applicationContext
    val trustManager = buildTrustManager(appContext)
    val sslContext = SSLContext.getInstance("TLS")
    sslContext.init(null, arrayOf(trustManager), null)

    OkHttpClientProvider.setOkHttpClientFactory {
      OkHttpClientProvider.createClientBuilder(appContext)
        .sslSocketFactory(sslContext.socketFactory, trustManager)
        .hostnameVerifier(IpAwareHostnameVerifier())
        .build()
    }
  }

  private fun buildTrustManager(context: Context): X509TrustManager {
    val platform = platformTrustManager()
    val extra = extraCaTrustManager(context)

    return object : X509TrustManager {
      override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) {
        platform.checkClientTrusted(chain, authType)
      }

      override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {
        try {
          platform.checkServerTrusted(chain, authType)
        } catch (platformError: CertificateException) {
          try {
            extra.checkServerTrusted(chain, authType)
          } catch (extraError: CertificateException) {
            Log.w(TAG, "TLS trust failed: ${platformError.message}")
            throw platformError
          }
        }
      }

      @Suppress("unused")
      fun checkServerTrusted(
        chain: Array<X509Certificate>,
        authType: String,
        host: String,
      ): List<X509Certificate> {
        checkServerTrusted(chain, authType)
        return chain.toList()
      }

      override fun getAcceptedIssuers(): Array<X509Certificate> {
        return platform.acceptedIssuers + extra.acceptedIssuers
      }
    }
  }

  private fun platformTrustManager(): X509TrustManager {
    val factory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm())
    factory.init(null as KeyStore?)
    return factory.trustManagers.first { it is X509TrustManager } as X509TrustManager
  }

  private fun extraCaTrustManager(context: Context): X509TrustManager {
    val certificateFactory = CertificateFactory.getInstance("X.509")
    val keyStore = KeyStore.getInstance(KeyStore.getDefaultType())
    keyStore.load(null, null)

    EXTRA_CA_RES_IDS.forEachIndexed { index, resId ->
      context.resources.openRawResource(resId).use { input ->
        val certs = certificateFactory.generateCertificates(input)
        certs.forEachIndexed { certIndex, cert ->
          keyStore.setCertificateEntry("le-gen-y-$index-$certIndex", cert)
        }
      }
    }

    val factory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm())
    factory.init(keyStore)
    return factory.trustManagers.first { it is X509TrustManager } as X509TrustManager
  }

  private class IpAwareHostnameVerifier : HostnameVerifier {
    private val platform = HttpsURLConnection.getDefaultHostnameVerifier()

    override fun verify(hostname: String, session: SSLSession): Boolean {
      if (platform.verify(hostname, session)) {
        return true
      }
      if (!IPV4.matches(hostname)) {
        return false
      }

      val peer =
        session.peerCertificates.firstOrNull() as? X509Certificate ?: return false
      val matched =
        peer.subjectAlternativeNames.orEmpty().any { entry ->
          val type = entry.getOrNull(0) as? Int ?: return@any false
          val value = entry.getOrNull(1)?.toString() ?: return@any false
          type == 7 && value == hostname
        }

      if (!matched) {
        Log.w(TAG, "Hostname mismatch for $hostname")
      }
      return matched
    }
  }
}
