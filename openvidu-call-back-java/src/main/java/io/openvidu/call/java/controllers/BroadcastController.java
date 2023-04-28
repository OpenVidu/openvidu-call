package io.openvidu.call.java.controllers;

import java.util.HashMap;
import java.util.Map;

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

import io.openvidu.call.java.services.OpenViduService;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/broadcasts")
public class BroadcastController {

	@Value("${OPENVIDU_URL}")
	private String OPENVIDU_URL;

	@Value("${OPENVIDU_SECRET}")
	private String OPENVIDU_SECRET;

	@Value("${CALL_BROADCAST}")
	private String CALL_BROADCAST;

	@Autowired
	private OpenViduService openviduService;

	@PostMapping("/start")
	public ResponseEntity<?> startBroadcast(@RequestBody(required = true) Map<String, String> params,
			@CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorToken) {
		Map<String, String> response = new HashMap<String, String>();
		response.put("broadcastAvailable", "false");

		try {
			boolean IS_BROADCAST_ENABLED = CALL_BROADCAST.toUpperCase().equals("ENABLED");
			if (IS_BROADCAST_ENABLED) {
				String sessionId = openviduService.getSessionIdFromCookie(moderatorToken);
				boolean isValidToken = openviduService.isModeratorSessionValid(sessionId, moderatorToken);
				if (!sessionId.isEmpty() && isValidToken) {

					if (this.openviduService.isCE()) {
						response.put("message", "Broadcast is not available on OpenVidu CE");
						return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
					}

					String broadcastUrl = params.get("broadcastUrl");
					this.openviduService.startBroadcast(sessionId, broadcastUrl);
					response.put("broadcastAvailable", "true");
					return new ResponseEntity<>(response, HttpStatus.ACCEPTED);

				} else {
					System.err.println("Permissions denied to drive broadcast");
					response.put("message", "Permissions denied to drive broadcast");
					return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
				}

			} else {
				System.err.println("OpenVidu Call Broadcast is not enabled");
				response.put("message", "OpenVidu Call Broadcast is disabled");
				return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
			}
		} catch (OpenViduJavaClientException | OpenViduHttpException e) {
			e.printStackTrace();
			return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@DeleteMapping("/stop")
	public ResponseEntity<?> stopBroadcast(
			@CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorToken) {
		try {
			Map<String, String> response = new HashMap<String, String>();
			boolean IS_BROADCAST_ENABLED = CALL_BROADCAST.toUpperCase().equals("ENABLED");
			if (IS_BROADCAST_ENABLED) {
				String sessionId = openviduService.getSessionIdFromCookie(moderatorToken);
				boolean isValidToken = openviduService.isModeratorSessionValid(sessionId, moderatorToken);
				if (!sessionId.isEmpty() && isValidToken) {
					System.out.println("Stopping broadcast in session " + sessionId);

					this.openviduService.stopBroadcast(sessionId);
					response.put("message", "Broadcasting stopped");
					response.put("broadcastAvailable", "true");
					return new ResponseEntity<>(null, HttpStatus.ACCEPTED);
				} else {
					System.err.println("Permissions denied to drive broadcast");
					return new ResponseEntity<>("Permissions denied to drive broadcast", HttpStatus.FORBIDDEN);
				}

			} else {
				System.err.println("OpenVidu Call Broadcast is not enabled");
				return new ResponseEntity<>("OpenVidu Call Broadcast is disabled", HttpStatus.FORBIDDEN);
			}
		} catch (OpenViduJavaClientException | OpenViduHttpException e) {
			e.printStackTrace();
			return new ResponseEntity<>("Unexpected error stopping broadcast", HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

}
