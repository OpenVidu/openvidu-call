package io.openvidu.call.java.services;

import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import io.openvidu.call.java.models.RecordingData;
import io.openvidu.java.client.Connection;
import io.openvidu.java.client.ConnectionProperties;
import io.openvidu.java.client.OpenVidu;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.openvidu.java.client.OpenViduRole;
import io.openvidu.java.client.Recording;
import io.openvidu.java.client.Session;
import io.openvidu.java.client.SessionProperties;

@Service
public class OpenViduService {

	public static final String MODERATOR_TOKEN_NAME = "ovCallModeratorToken";
	public Map<String, RecordingData> recordingMap = new HashMap<String, RecordingData>();
	public Map<String, String> streamingMap = new HashMap<String, String>();

	@Value("${OPENVIDU_URL}")
	public String OPENVIDU_URL;

	@Value("${OPENVIDU_SECRET}")
	private String OPENVIDU_SECRET;

	private OpenVidu openvidu;
	private String edition;

	@PostConstruct
	public void init() {
		this.openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
	}

	public String getBasicAuth() {
		String stringToEncode = "OPENVIDUAPP:" + OPENVIDU_SECRET;
		String encodedString = Base64.getEncoder().encodeToString(stringToEncode.getBytes());
		return "Basic " + new String(encodedString);
	}

	public boolean isPRO() {
		return this.edition.toUpperCase().equals("PRO");
	}

	public boolean isCE() {
		return this.edition.toUpperCase().equals("CE");
	}

	public long getDateFromCookie(String recordingToken) {
		try {
			if (!recordingToken.isEmpty()) {
				MultiValueMap<String, String> cookieTokenParams = UriComponentsBuilder.fromUriString(recordingToken)
						.build()
						.getQueryParams();
				String date = cookieTokenParams.get("createdAt").get(0);
				return Long.parseLong(date);
			} else {
				return System.currentTimeMillis();
			}
		} catch (Exception e) {
			return System.currentTimeMillis();
		}
	}

	public String getSessionIdFromCookie(String cookie) {
		try {

			if (!cookie.isEmpty()) {
				MultiValueMap<String, String> cookieTokenParams = UriComponentsBuilder.fromUriString(cookie)
						.build().getQueryParams();
				return cookieTokenParams.get("sessionId").get(0);
			}

		} catch (Exception error) {
			System.out.println("Moderator cookie not found");
			System.err.println(error);
		}
		return "";

	}

	public boolean isValidToken(String sessionId, String token) {
		try {

			if (!token.isEmpty()) {
				MultiValueMap<String, String> storedTokenParams = null;

				if (this.recordingMap.containsKey(sessionId)) {
					storedTokenParams = UriComponentsBuilder
							.fromUriString(this.recordingMap.get(sessionId).getToken()).build().getQueryParams();
				}

				MultiValueMap<String, String> cookieTokenParams = UriComponentsBuilder
						.fromUriString(token).build().getQueryParams();

				if (!cookieTokenParams.isEmpty() && storedTokenParams != null) {
					String cookieSessionId = cookieTokenParams.get("sessionId").get(0);
					String cookieToken = cookieTokenParams.get(MODERATOR_TOKEN_NAME).get(0);
					String cookieDate = cookieTokenParams.get("createdAt").get(0);

					String storedToken = storedTokenParams.get(MODERATOR_TOKEN_NAME).get(0);
					String storedDate = storedTokenParams.get("createdAt").get(0);

					return sessionId.equals(cookieSessionId) && cookieToken.equals(storedToken)
							&& cookieDate.equals(storedDate);
				}
			}

			return false;
		} catch (Exception e) {
			return false;
		}
	}

	public Session createSession(String sessionId) throws OpenViduJavaClientException, OpenViduHttpException {
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("customSessionId", sessionId);
		SessionProperties properties = SessionProperties.fromJson(params).build();
		Session session = openvidu.createSession(properties);
		session.fetch();
		return session;
	}

	public Connection createConnection(Session session, String nickname, OpenViduRole role)
			throws OpenViduJavaClientException, OpenViduHttpException {
		Map<String, Object> params = new HashMap<String, Object>();
		Map<String, Object> connectionData = new HashMap<String, Object>();

		if (!nickname.isEmpty()) {
			connectionData.put("openviduCustomConnectionId", nickname);
		}
		params.put("role", role.name());
		params.put("data", connectionData.toString());
		ConnectionProperties properties = ConnectionProperties.fromJson(params).build();

		Connection connection = session.createConnection(properties);

		MultiValueMap<String, String> tokenParams = UriComponentsBuilder
				.fromUriString(connection.getToken()).build().getQueryParams();
		;
		this.edition = tokenParams.get("edition").get(0);

		return connection;

	}

	public Recording startRecording(String sessionId) throws OpenViduJavaClientException, OpenViduHttpException {
		return this.openvidu.startRecording(sessionId);
	}

	public Recording stopRecording(String recordingId) throws OpenViduJavaClientException, OpenViduHttpException {
		return this.openvidu.stopRecording(recordingId);
	}

	public void deleteRecording(String recordingId) throws OpenViduJavaClientException, OpenViduHttpException {
		this.openvidu.deleteRecording(recordingId);
	}

	public Recording getRecording(String recordingId) throws OpenViduJavaClientException, OpenViduHttpException {
		return this.openvidu.getRecording(recordingId);
	}

	public List<Recording> listAllRecordings() throws OpenViduJavaClientException, OpenViduHttpException {
		return this.openvidu.listRecordings();
	}

	public List<Recording> listRecordingsBySessionIdAndDate(String sessionId, long date)
			throws OpenViduJavaClientException, OpenViduHttpException {
		List<Recording> recordings = this.listAllRecordings();
		List<Recording> recordingsAux = new ArrayList<Recording>();
		for (Recording recording : recordings) {
			if (recording.getSessionId().equals(sessionId) && date <= recording.getCreatedAt()) {
				recordingsAux.add(recording);
			}
		}
		return recordingsAux;
	}

	public void startBroadcast(String sessionId, String broadcastUrl)
			throws OpenViduJavaClientException, OpenViduHttpException {
		this.openvidu.startBroadcast(sessionId, broadcastUrl);
	}

	public void stopBroadcast(String sessionId) throws OpenViduJavaClientException, OpenViduHttpException {
		this.openvidu.stopBroadcast(sessionId);
	}

}
