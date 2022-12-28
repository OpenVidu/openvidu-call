package io.openvidu.call.java.controllers;

import java.io.IOException;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.openvidu.call.java.services.OpenViduService;
import io.openvidu.call.java.services.ProxyService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/streamings")
public class StreamingController {

	@Value("${OPENVIDU_URL}")
	private String OPENVIDU_URL;

	@Value("${OPENVIDU_SECRET}")
	private String OPENVIDU_SECRET;

	@Value("${CALL_STREAMING}")
	private String CALL_STREAMING;

	@Value("${RTMP_EXPORTER_URL}")
	private String RTMP_EXPORTER_URL;

	@Value("${RTMP_EXPORTER_CREDENTIALS}")
	private String RTMP_EXPORTER_CREDENTIALS;

	@Autowired
	private OpenViduService openviduService;

	@Autowired
	private ProxyService proxyService;
	
	private final String RTMP_PATH = "/api/streams/";

	@PostMapping("/start")
	public ResponseEntity<?> startStreaming(@RequestBody(required = true) Map<String, String> params,
			@CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorToken,
			HttpServletRequest req,
			HttpServletResponse res) {
		Map<String, String> response = new HashMap<String, String>();
		response.put("rtmpAvailable", "true");

		try {
			boolean IS_STREAMING_ENABLED = CALL_STREAMING.toUpperCase().equals("ENABLED");
			if (IS_STREAMING_ENABLED) {
				String sessionId = openviduService.getSessionIdFromCookie(moderatorToken);
				boolean isValidToken = openviduService.isValidToken(sessionId, moderatorToken);
				if (!sessionId.isEmpty() && isValidToken) {

					boolean isPRO = openviduService.isPRO();
					boolean isLocalDeployment = OPENVIDU_URL.contains("localhost")
							|| OPENVIDU_URL.contains("127.0.0.1");
					int port = isLocalDeployment ? 4443 : 443;
					String protocol = OPENVIDU_URL.contains("https") ? "https" : "http";
					String ovDomain = OPENVIDU_URL.replace(protocol + "://", "");
					String ovPath = isPRO ? "inspector" : "dashboard";
					String pageUrl = protocol + "://OPENVIDUAPP:" + OPENVIDU_SECRET + "@" + ovDomain + "/" + ovPath
							+ "/#/layout-best-fit/" + sessionId + "/" + OPENVIDU_SECRET + "/" + port + "/" + false;
					
					params.put("pageUrl", pageUrl);
					Map<String, String> headers = new HashMap<String, String>();
					headers.put("Authorization", "Basic " + Base64.getEncoder().encodeToString(RTMP_EXPORTER_CREDENTIALS.getBytes()));
					
					HttpResponse<String> rtmpResponse = proxyService.sendPost(RTMP_EXPORTER_URL + RTMP_PATH, params, headers);
					if (rtmpResponse != null && rtmpResponse.statusCode() == 200) {
						JsonObject jsonResponse = new Gson().fromJson(rtmpResponse.body().toString(), JsonObject.class);
						jsonResponse.addProperty("rtmpAvailable", true);
						openviduService.streamingMap.put(sessionId, jsonResponse.get("id").getAsString());
						
						return new ResponseEntity<>(jsonResponse, HttpStatus.OK);
					} else {
						response.put("rtmpAvailable", null);
						response.put("message", rtmpResponse.body());
					}
					
					return new ResponseEntity<>(response, HttpStatus.resolve(rtmpResponse.statusCode()));

				} else {
					System.err.println("Permissions denied to drive streaming");
					response.put("message", "Permissions denied to drive streaming");
					return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
				}

			} else {
				System.err.println("OpenVidu Call Streaming is not enabled");
				response.put("message", "OpenVidu Call Streaming is disabled");
				return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
			}
		} catch (IOException | InterruptedException e) {
			e.printStackTrace();
			if(e.getCause().getMessage().equals("Connection refused")) {
				response.put("rtmpAvailable", null);
				response.put("message", "Cannot connect with RTMP service");
			} else {				
				response.put("message", "Unexpected error starting streaming");
			}
			return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		} 
	}

	@DeleteMapping("/stop")
	public ResponseEntity<?> stopStreaming(
			@CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorToken,
			HttpServletRequest req,
			HttpServletResponse res) {
		try {
			boolean IS_STREAMING_ENABLED = CALL_STREAMING.toUpperCase().equals("ENABLED");
			if (IS_STREAMING_ENABLED) {
				String sessionId = openviduService.getSessionIdFromCookie(moderatorToken);
				boolean isValidToken = openviduService.isValidToken(sessionId, moderatorToken);
				if (!sessionId.isEmpty() && isValidToken) {
					String streamingId = openviduService.streamingMap.get(sessionId);
					if (streamingId == null) {
						return new ResponseEntity<>("Streaming of Session " + sessionId + " not found",
								HttpStatus.NOT_FOUND);
					}

					Map<String, String> headers = new HashMap<String, String>();
					headers.put("Authorization", "Basic " + Base64.getEncoder().encodeToString(RTMP_EXPORTER_CREDENTIALS.getBytes()));
					HttpResponse<String> rtmpResponse = proxyService.sendDelete(RTMP_EXPORTER_URL + RTMP_PATH + streamingId, headers);
					if (rtmpResponse != null && rtmpResponse.statusCode() == 200) {
						JsonObject jsonResponse = new Gson().fromJson(rtmpResponse.body().toString(), JsonObject.class);
						jsonResponse.addProperty("rtmpAvailable", true);
						openviduService.streamingMap.remove(sessionId);
						return new ResponseEntity<>(jsonResponse, HttpStatus.OK);
					}
					
					return new ResponseEntity<>(rtmpResponse.body(), HttpStatus.resolve(rtmpResponse.statusCode()));

				} else {
					System.err.println("Permissions denied to drive streaming");
					return new ResponseEntity<>("Permissions denied to drive streaming", HttpStatus.FORBIDDEN);
				}

			} else {
				System.err.println("OpenVidu Call Streaming is not enabled");
				return new ResponseEntity<>("OpenVidu Call Streaming is disabled", HttpStatus.FORBIDDEN);
			}
		} catch (IOException | InterruptedException e) {
			e.printStackTrace();
			return new ResponseEntity<>("Unexpected error stopping streaming", HttpStatus.INTERNAL_SERVER_ERROR);

		}

	}

}
