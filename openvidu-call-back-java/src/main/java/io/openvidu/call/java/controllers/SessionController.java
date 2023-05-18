package io.openvidu.call.java.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import io.openvidu.call.java.models.RecordingData;
import io.openvidu.call.java.services.OpenViduService;
import io.openvidu.java.client.Connection;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.openvidu.java.client.OpenViduRole;
import io.openvidu.java.client.Recording;
import io.openvidu.java.client.Session;

@CrossOrigin(origins = "*")
@RestController
public class SessionController {

	@Value("${CALL_RECORDING}")
	private String CALL_RECORDING;

	@Value("${CALL_BROADCAST}")
	private String CALL_BROADCAST;

	@Autowired
	private OpenViduService openviduService;

	private final int cookieAdminMaxAge = 24 * 60 * 60;

	@PostMapping("/sessions")
	public ResponseEntity<Map<String, Object>> createConnection(
			@RequestBody(required = true) Map<String, Object> params,
			@CookieValue(name = OpenViduService.MODERATOR_TOKEN_NAME, defaultValue = "") String moderatorCookie,
			@CookieValue(name = OpenViduService.PARTICIPANT_TOKEN_NAME, defaultValue = "") String participantCookie,
			HttpServletResponse res) {

		Map<String, Object> response = new HashMap<String, Object>();
		try {
			long date = -1;
			String nickname = "";

			String sessionId = params.get("sessionId").toString();
			if (params.containsKey("nickname")) {
				nickname = params.get("nickname").toString();
			}

			Session sessionCreated = this.openviduService.createSession(sessionId);
			String MODERATOR_TOKEN_NAME = OpenViduService.MODERATOR_TOKEN_NAME;
			String PARTICIPANT_TOKEN_NAME = OpenViduService.PARTICIPANT_TOKEN_NAME;
			boolean IS_RECORDING_ENABLED = CALL_RECORDING.toUpperCase().equals("ENABLED");
			boolean IS_BROADCAST_ENABLED = CALL_BROADCAST.toUpperCase().equals("ENABLED");
			boolean PRIVATE_FEATURES_ENABLED = IS_RECORDING_ENABLED || IS_BROADCAST_ENABLED;

			boolean hasModeratorValidToken = this.openviduService.isModeratorSessionValid(sessionId, moderatorCookie);
			boolean hasParticipantValidToken = this.openviduService.isParticipantSessionValid(sessionId,
					participantCookie);
			boolean hasValidToken = hasModeratorValidToken || hasParticipantValidToken;
			boolean iAmTheFirstConnection = sessionCreated.getActiveConnections().size() == 0;
			boolean isSessionCreator = hasModeratorValidToken || iAmTheFirstConnection;

			OpenViduRole role = isSessionCreator ? OpenViduRole.MODERATOR : OpenViduRole.PUBLISHER;

			response.put("recordingEnabled", IS_RECORDING_ENABLED);
			response.put("recordings", new ArrayList<Recording>());
			response.put("broadcastingEnabled", IS_BROADCAST_ENABLED);
			response.put("isRecordingActive", sessionCreated.isBeingRecorded());
			response.put("isBroadcastingActive", sessionCreated.isBeingBroadcasted());

			Connection cameraConnection = this.openviduService.createConnection(sessionCreated, nickname, role);
			Connection screenConnection = this.openviduService.createConnection(sessionCreated, nickname, role);

			response.put("cameraToken", cameraConnection.getToken());
			response.put("screenToken", screenConnection.getToken());

			if (!hasValidToken && PRIVATE_FEATURES_ENABLED) {
				/**
				 * ! *********** WARN *********** !
				 *
				 * To identify who is able to manage session recording and streaming, the code
				 * sends a cookie
				 * with a token to the session creator. The relation between cookies and
				 * sessions are stored in backend memory.
				 *
				 * This authentication & authorization system is pretty basic and it is not for
				 * production. We highly recommend IMPLEMENT YOUR OWN USER MANAGEMENT with
				 * persistence for a properly and secure recording feature.
				 *
				 * ! *********** WARN *********** !
				 **/
				String uuid = UUID.randomUUID().toString();
				date = System.currentTimeMillis();

				if (isSessionCreator) {
					String moderatorToken = cameraConnection.getToken() + "&" + MODERATOR_TOKEN_NAME + "="
							+ uuid + "&createdAt=" + date;

					Cookie cookie = new Cookie(MODERATOR_TOKEN_NAME, moderatorToken);
					cookie.setMaxAge(cookieAdminMaxAge);
					res.addCookie(cookie);
					// Remove participant cookie if exists
					Cookie oldCookie = new Cookie(PARTICIPANT_TOKEN_NAME, "");
					oldCookie.setMaxAge(0);
					res.addCookie(oldCookie);

					RecordingData recData = new RecordingData(moderatorToken, "");
					this.openviduService.moderatorsCookieMap.put(sessionId, recData);

				} else {
					String participantToken = cameraConnection.getToken() + "&" + PARTICIPANT_TOKEN_NAME + "="
							+ uuid + "&createdAt=" + date;

					Cookie cookie = new Cookie(PARTICIPANT_TOKEN_NAME, participantToken);
					cookie.setMaxAge(cookieAdminMaxAge);
					res.addCookie(cookie);
					// Remove moderator cookie if exists
					Cookie oldCookie = new Cookie(MODERATOR_TOKEN_NAME, "");
					oldCookie.setMaxAge(0);
					res.addCookie(oldCookie);

					List<String> tokens = this.openviduService.participantsCookieMap.containsKey(sessionId)
							? this.openviduService.participantsCookieMap.get(sessionId)
							: new ArrayList<String>();
					tokens.add(participantToken);
					this.openviduService.participantsCookieMap.put(sessionId, tokens);
				}
			}

			if (IS_RECORDING_ENABLED) {
				try {
					if (date == -1) {
						date = openviduService.getDateFromCookie(moderatorCookie);
					}
					List<Recording> recordings = openviduService.listRecordingsBySessionIdAndDate(sessionId, date);
					response.put("recordings", recordings);
				} catch (OpenViduHttpException e) {
					if (e.getStatus() == 501) {
						System.out.println("Recording is disabled in OpenVidu Server.");
					}
				} catch (Exception e) {
					System.out.println("Unknown error listing recordings");
					e.printStackTrace();
				}
			}

			return new ResponseEntity<>(response, HttpStatus.OK);

		} catch (OpenViduJavaClientException | OpenViduHttpException e) {

			if (e.getMessage() != null && Integer.parseInt(e.getMessage()) == 501) {
				System.err.println("OpenVidu Server recording module is disabled");
				return new ResponseEntity<>(response, HttpStatus.OK);
			} else if (e.getMessage() != null && Integer.parseInt(e.getMessage()) == 401) {
				System.err.println("OpenVidu credentials are wrong.");
				return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
			} else {
				e.printStackTrace();
				System.err.println(e.getMessage());
				return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (Exception e) {
			e.printStackTrace();
			System.err.println(e.getMessage());
			return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
