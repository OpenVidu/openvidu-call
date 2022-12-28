package io.openvidu.call.java.services;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import io.openvidu.call.java.models.AdminSessionData;

@Service

public class AuthService {
	public static final String ADMIN_COOKIE_NAME = "ovCallAdminToken";
	public Map<String, AdminSessionData> adminSessions = new HashMap<String, AdminSessionData>();


	public boolean isAdminSessionValid(String sessionId) {
		if(sessionId.isBlank()) return false;
		
		AdminSessionData adminCookie = this.adminSessions.get(sessionId);
		if(adminCookie == null) return false;
		return adminCookie.getExpires() > new Date().getTime();
	}

}
