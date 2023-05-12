package io.openvidu.call.java.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.openvidu.call.java.models.AdminSessionData;
import io.openvidu.call.java.services.AuthService;
import io.openvidu.call.java.services.OpenViduService;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.openvidu.java.client.Recording;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("auth")
public class AuthController {
	
	private int cookieAdminMaxAge = 24 * 60 * 60; //24 hours

	@Value("${CALL_USER}")
	private String CALL_USER;

	@Value("${CALL_SECRET}")
	private String CALL_SECRET;

	@Value("${CALL_ADMIN_SECRET}")
	private String CALL_ADMIN_SECRET;
	
	@Value("${CALL_OPENVIDU_CERTTYPE}")
	private String CALL_OPENVIDU_CERTTYPE;

	@Autowired
	private OpenViduService openviduService;
	
	@Autowired
	private AuthService authService;

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody(required = true) Map<String, String> params) {

		String username = params.get("username");
		String password = params.get("password");

		if (username.equals(CALL_USER) && password.equals(CALL_SECRET)) {
			System.out.println("Login succeeded");
			return new ResponseEntity<>("", HttpStatus.OK);
		} else {
			return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
		}
	}

	@PostMapping("/admin/login")
	public ResponseEntity<?> adminLogin(@RequestBody(required = true) Map<String, String> params,
			@CookieValue(name = AuthService.ADMIN_COOKIE_NAME, defaultValue = "") String adminToken,
			HttpServletResponse res) {

		String message = "";
		Map<String, Object> response = new HashMap<String, Object>();

		String password = params.get("password");
		boolean isAdminSessionValid = authService.isAdminSessionValid(adminToken);

		boolean isAuthValid = password.equals(CALL_ADMIN_SECRET) || isAdminSessionValid;
		if (isAuthValid) {
			try {
				if (!isAdminSessionValid) {
					// Generate a new session cookie
					String id = UUID.randomUUID().toString();

					Cookie cookie = new Cookie(AuthService.ADMIN_COOKIE_NAME, id);
					cookie.setPath("/");
					cookie.setMaxAge(cookieAdminMaxAge);
					cookie.setSecure(CALL_OPENVIDU_CERTTYPE.equals("selfsigned"));
					res.addCookie(cookie);
					
					Cookie moderatorCookie = new Cookie(OpenViduService.MODERATOR_TOKEN_NAME, "");
					moderatorCookie.setPath("/");
					moderatorCookie.setMaxAge(0);
					res.addCookie(moderatorCookie);
					
					Cookie participantCookie = new Cookie(OpenViduService.PARTICIPANT_TOKEN_NAME, "");
					participantCookie.setPath("/");
					participantCookie.setMaxAge(0);
					res.addCookie(participantCookie);

					AdminSessionData data = new AdminSessionData(System.currentTimeMillis() + cookieAdminMaxAge * 1000);
					authService.adminSessions.put(id, data);
				}
				List<Recording> recordings = openviduService.listAllRecordings();
				System.out.println("Login succeeded");
				System.out.println(recordings.size() + " Recordings found");
				response.put("recordings", recordings);

				return new ResponseEntity<>(response, HttpStatus.OK);
			} catch (OpenViduJavaClientException | OpenViduHttpException error) {

				if (Integer.parseInt(error.getMessage()) == 501) {
					System.err.println(error.getMessage() + ". OpenVidu Server recording module is disabled.");
					return new ResponseEntity<>(response, HttpStatus.OK);
				} else {
					message = error.getMessage() + " Unexpected error getting recordings";
					error.printStackTrace();
					System.err.println(message);
					return new ResponseEntity<>(message, HttpStatus.INTERNAL_SERVER_ERROR);
				}

			}
		} else {
			message = "Permissions denied";
			System.err.println(message);
			return new ResponseEntity<>(null, HttpStatus.FORBIDDEN);
		}

	}

	@PostMapping("/admin/logout")
	public ResponseEntity<Void> adminLogout(@CookieValue(name = AuthService.ADMIN_COOKIE_NAME, defaultValue = "") String adminToken,
			HttpServletRequest req,
			HttpServletResponse res) {
		
		authService.adminSessions.remove(adminToken);
		
	    Cookie cookie = new Cookie(AuthService.ADMIN_COOKIE_NAME, "");
		cookie.setPath("/");
		cookie.setMaxAge(0);
		res.addCookie(cookie);
		
		return ResponseEntity.ok().build();
	}

}
