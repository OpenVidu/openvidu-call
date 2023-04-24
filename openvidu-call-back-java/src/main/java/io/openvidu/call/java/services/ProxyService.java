package io.openvidu.call.java.services;

import java.io.IOException;
import java.lang.reflect.Type;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublisher;
import java.net.http.HttpRequest.Builder;
import java.net.http.HttpResponse;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

@Service
public class ProxyService {

	@Value("${OPENVIDU_URL}")
	public String OPENVIDU_URL;

	@Autowired
	private OpenViduService openviduService;

	private HttpClient client;

	public ProxyService() {
		try {
			this.client = this.createClientAllowingInsecureCert();
		} catch (KeyManagementException | NoSuchAlgorithmException e) {
			System.out.println("Error creating httpClient allowing insecure cert. Creating a secured one");
			this.client = HttpClient.newBuilder().build();
		}
	}

	public ResponseEntity<?> recordingProxyRequest(HttpServletRequest request, HttpServletResponse response)
			throws URISyntaxException {

		String requestUrl = request.getRequestURI();

		URI uri = UriComponentsBuilder.fromUriString(OPENVIDU_URL + "/openvidu").path(requestUrl)
				.query(request.getQueryString()).build(true).toUri();

		HttpHeaders headers = new HttpHeaders();
		Enumeration<String> headerNames = request.getHeaderNames();

		while (headerNames.hasMoreElements()) {
			String headerName = headerNames.nextElement();
			headers.set(headerName, request.getHeader(headerName));
		}

		headers.set("Authorization", this.openviduService.getBasicAuth());
		headers.remove("Cookie");
		headers.remove(HttpHeaders.ACCEPT_ENCODING);
		
		HttpEntity<?> httpEntity = new HttpEntity<>(null, headers);
		ClientHttpRequestFactory factory = new BufferingClientHttpRequestFactory(new SimpleClientHttpRequestFactory());
		RestTemplate restTemplate = new RestTemplate(factory);

		restTemplate.setInterceptors(Collections.singletonList((requestIntercept, body, execution) -> {
			ClientHttpResponse responseIntercept = execution.execute(requestIntercept, body);
			responseIntercept.getHeaders().remove("set-cookie");
			return responseIntercept;
		}));

		try {
			return restTemplate.exchange(uri, HttpMethod.GET, httpEntity, byte[].class);

		} catch (HttpStatusCodeException e) {
			System.err.println(e.getMessage());
			return ResponseEntity.status(e.getRawStatusCode()).headers(e.getResponseHeaders())
					.body(e.getResponseBodyAsString());
		}

	}

	public HttpResponse<String> sendPost(String url, Map<String, String> body, Map<String, String> headers)
			throws InterruptedException, IllegalArgumentException, IOException {

		Builder requestBuilder = HttpRequest.newBuilder().uri(URI.create(url));
		BodyPublisher postBody;

		headers.forEach((k, v) -> {
			requestBuilder.header(k, v);
		});

		requestBuilder.header("Content-Type", "application/json");
		Gson gson = new Gson();
		Type gsonType = new TypeToken<HashMap<String, String>>() {
		}.getType();
		String gsonString = gson.toJson(body, gsonType);
		postBody = HttpRequest.BodyPublishers.ofString(gsonString);
		HttpRequest request = requestBuilder.POST(postBody).timeout(Duration.ofSeconds(60)).build();
		return client.send(request, HttpResponse.BodyHandlers.ofString());
	}

	public HttpResponse<String> sendGet(String url, Map<String, String> headers)
			throws IOException, InterruptedException {

		Builder requestBuilder = HttpRequest.newBuilder().uri(URI.create(url));

		headers.forEach((k, v) -> {
			requestBuilder.header(k, v);
		});
		headers.remove("Cookie");
		headers.remove(HttpHeaders.ACCEPT_ENCODING);

		HttpRequest request = requestBuilder.GET().build();
		return client.send(request, HttpResponse.BodyHandlers.ofString());
	}

	public HttpResponse<String> sendDelete(String url, Map<String, String> headers)
			throws IOException, InterruptedException {
		Builder requestBuilder = HttpRequest.newBuilder().uri(URI.create(url));
		headers.forEach((k, v) -> {
			requestBuilder.header(k, v);
		});
		HttpRequest request = requestBuilder.DELETE().build();
		return client.send(request, HttpResponse.BodyHandlers.ofString());
	}

	private HttpClient createClientAllowingInsecureCert() throws NoSuchAlgorithmException, KeyManagementException {
		final Properties props = System.getProperties();
		props.setProperty("jdk.internal.httpclient.disableHostnameVerification", Boolean.TRUE.toString());
		props.setProperty("jdk.httpclient.allowRestrictedHeaders", Boolean.TRUE.toString());
		props.setProperty("jdk.httpclient.keepalive.timeout", "0");

		// Create a trust manager that does not validate certificate chains
		TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
			public java.security.cert.X509Certificate[] getAcceptedIssuers() {
				return null;
			}

			public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) {
			}

			public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) {
			}
		} };

		// Install the all-trusting trust manager
		SSLContext sc = SSLContext.getInstance("SSL");
		sc.init(null, trustAllCerts, new java.security.SecureRandom());
		HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
		return HttpClient.newBuilder().sslContext(sc).build();
	}
}
