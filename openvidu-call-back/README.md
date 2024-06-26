# REST API Documentation

Below are the available routes in the REST API along with their respective descriptions, authentication requirements, response fields, and error examples.

## Room Controller

### Create Room

-   **Route:** `POST /call/api/rooms`
-   **Description:** Creates a new room.
-   **Authentication Required:** Depends on environment variable `CALL_PRIVATE_ACCESS`. If set to true, basic authentication is required.
-   **Body:** Required.
    -   **Example:**
        ```json
        {
        	"participantName": "John Doe",
        	"roomName": "daily-call"
        }
        ```
-   **Response:** JSON object which contains the token.
    -   **Example:** `{ "token": "abcdefghi.jklm.zxy" }`
-   **Error:**
    -   **Code:** 400 Bad Request
        -   **Example:** `{ "name": "Room Error", "message": "Room name is required for this operation" }`
        -   **Example:** `{ "name": "Room Error", "message": "Room name is required for this operation" }`
    -   **Code:** 500 Internal Server Error
        -   **Example:** `{ "name": "Room Error", "message": "Failed to create room" }`

## Recording Controller

### Start Recording

-   **Route:** `POST /call/api/recordings`
-   **Description:** Starts a new recording session.
-   **Authentication Required:** Yes, basic authentication for user.
-   **Body:** Required.
    -   **Example:**
        ```json
        {
        	"roomName": "daily-call"
        }
        ```
-   **Response:** JSON object which includes the recording ID and status.
    -   **Example:**
        ```json
			{
				"id": "EG_nYr6Z7SsZeVM",
				"status": "ready",
				"filename": "daily-call-1715607371162.mp4",
				"startedAt": 1715607372545.0586,
				"endedAt": 1715607441558.5054,
				"duration": 65.958361838,
				"size": 37557904,
				"location": "https://openvidu.s3.amazonaws.com/daily-call-1715607371162/daily-call-1715607371162.mp4"
			},
		```
-   **Error:**
    -   **Code:** 400 Bad Request
        -   **Example:** `{ "name": "Recording Error", "message": "Room name is required for this operation" }`
    -   **Code:** 500 Internal Server Error
        -   **Example:** `{ "name": "Recording Error", "message": "Failed to start recording" }`

### Stop Recording

-   **Route:** `PUT /call/api/recordings/:recordingId`
-   **Description:** Stops an ongoing recording session.
-   **Authentication Required:** Yes, basic authentication for user.
-   **URL Parameters:** `recordingId` is required.
-   **Body:** Not required.
-   **Response:** JSON object which includes the recording ID and status.
    -   **Example:**
        ```json
        {
        	"message": "Recording stopped"
        }
        ```
-   **Error:**
    -   **Code:** 400 Bad Request
        -   **Example:** `{ "name": "Recording Error", "message": "Recording ID is required for this operation" }`
    -   **Code:** 404 Not Found
        -   **Example:** `{ "name": "Recording Error", "message": "Recording EG_nYr6Z7SsZeVM not found" }`
    -   **Code:** 500 Internal Server Error
        -   **Example:** `{ "name": "Recording Error", "message": "Failed to stop recording" }`

### Get All Recordings

-   **Route:** `GET /call/api/recordings`
-   **Description:** Retrieves a list of all recordings.
-   **Authentication Required:** Yes, basic authentication for user and admin.
-   **Body:** Not required.
-   **Response:** Array of recording objects.
    -   **Example:**
        ```json
        [
        	{
        		"recordingId": "rec_123456",
        		"roomName": "Room 1",
        		"status": "completed",
        		"createdAt": "2023-01-01T00:00:00Z"
        	},
        	{
        		"recordingId": "rec_654321",
        		"roomName": "Room 2",
        		"status": "completed",
        		"createdAt": "2023-01-02T00:00:00Z"
        	}
        ]
        ```
-   **Error:**
    -   **Code:** 500 Internal Server Error
        -   **Example:** `{ "name": "Recording Error", "message": "Failed to retrieve recordings" }`

### Stream Recording

-   **Route:** `GET /call/api/recordings/:recordingId/stream`
-   **Description:** Streams the recording with the specified ID.
-   **Authentication Required:** No.
-   **URL Parameters:** `recordingId` is required.
-   **Body:** Not required.
-   **Response:** Streaming content of the recording.
-   **Error:**
    -   **Code:** 404 Not Found
        -   **Example:** `{ "name": "Streaming Error", "message": "Recording not found" }`
    -   **Code:** 500 Internal Server Error
        -   **Example:** `{ "name": "Streaming Error", "message": "Failed to stream recording" }`

### Delete Recording

-   **Route:** `DELETE /call/api/recordings/:recordingId`
-   **Description:** Deletes the recording with the specified ID.
-   **Authentication Required:** Yes, basic authentication for user and admin.
-   **URL Parameters:** `recordingId` is required.
-   **Body:** Not required.
-   **Response:** JSON object confirming the deletion.
    -   **Example:**
        ```json
        {
        	"message": "Recording deleted successfully"
        }
        ```
-   **Error:**
    -   **Code:** 400 Bad Request
        -   **Example:** `{ "name": "Deletion Error", "message": "Invalid recording ID" }`
    -   **Code:** 404 Not Found
        -   **Example:** `{ "name": "Deletion Error", "message": "Recording not found" }`
    -   **Code:** 500 Internal Server Error
        -   **Example:** `{ "name": "Deletion Error", "message": "Failed to delete recording" }`

## Broadcasting Controller

### Start Broadcasting

-   **Route:** `POST /call/api/broadcasts`
-   **Description:** Starts a new broadcasting session.
-   **Authentication Required:** Yes, basic authentication for user.
-   **Body:** Required.
    -   **Example:**
        ```json
        {
        	"roomName": "Room 1",
        	"quality": "1080p"
        }
        ```
-   **Response:** JSON object which includes the broadcast ID and status.
    -   **Example:**
        ```json
        {
        	"broadcastId": "brdcst_123456",
        	"status": "started"
        }
        ```
-   **Error:**
    -   **Code:** 400 Bad Request
        -   **Example:** `{ "name": "Broadcast Error", "message": "Room name and quality are required for this operation" }`
    -   **Code:** 500 Internal Server Error
        -   **Example:** `{ "name": "Broadcast Error", "message": "Failed to start broadcasting" }`

### Stop Broadcasting

-   **Route:** `PUT /call/api/broadcasts/:broadcastId`
-   **Description:** Stops an ongoing broadcasting session.
-   **Authentication Required:** Yes, basic authentication for user.
-   **URL Parameters:** `broadcastId` is required.
-   **Body:** Not required.
-   **Response:** JSON object which includes the broadcast ID and status.
    -   **Example:**
        ```json
        {
        	"broadcastId": "brdcst_123456",
        	"status": "stopped"
        }
        ```
-   **Error:**
    -   **Code:** 400 Bad Request
        -   **Example:** `{ "name": "Broadcast Error", "message": "Invalid broadcast ID" }`
    -   **Code:** 404 Not Found
        -   **Example:** `{ "name": "Broadcast Error", "message": "Broadcast not found" }`
    -   **Code:** 500 Internal Server Error
        -   **Example:** `{ "name": "Broadcast Error", "message": "Failed to stop broadcasting" }`

## Auth Controller

### User Login

-   **Route:** `POST /call/api/login`
-   **Description:** Authenticates a user and creates a session.
-   **Authentication Required:** Yes, basic authentication for user.
-   **Body:** Not required (credentials should be sent via HTTP Basic Authentication header).
-   **Response:** JSON object which includes the session token.
    -   **Example:**
        ```json
        {
        	"message": "Login successful",
        	"token": "session_token_here"
        }
        ```
-   **Error:**
    -   **Code:** 401 Unauthorized
        -   **Example:** `{ "name": "Auth Error", "message": "Invalid credentials" }`
    -   **Code:** 500 Internal Server Error
        -   **Example:** `{ "name": "Auth Error", "message": "Login failed due to a server error" }`

### User Logout

-   **Route:** `POST /call/api/logout`
-   **Description:** Ends the user's session.
-   **Authentication Required:** No.
-   **Body:** Not required.
-   **Response:** JSON object confirming the session has ended.
    -   **Example:**
        ```json
        {
        	"message": "Logout successful"
        }
        ```
-   **Error:**
    -   **Code:** 500 Internal Server Error
        -   **Example:** `{ "name": "Auth Error", "message": "Logout failed due to a server error" }`

### Admin Login

-   **Route:** `POST /call/api/admin/login`
-   **Description:** Authenticates an admin user and creates a session.
-   **Authentication Required:** Yes, basic authentication for admin.
-   **Body:** Not required (credentials should be sent via HTTP Basic Authentication header).
-   **Response:** JSON object which includes the admin session token.
    -   **Example:**
        ```json
        {
        	"message": "Admin login successful",
        	"token": "admin_session_token_here"
        }
        ```
-   **Error:**
    -   **Code:** 401 Unauthorized
        -   **Example:** `{ "name": "Auth Error", "message": "Invalid admin credentials" }`
    -   **Code:** 500 Internal Server Error
        -   **Example:** `{ "name": "Auth Error", "message": "Admin login failed due to server error" }`

### Admin Logout

-   **Route:** `POST /call/api/admin/logout`
-   **Description:** Ends the admin user's session.
-   **Authentication Required:** No.
-   **Body:** Not required.
-   **Response:** JSON object confirming the admin session has ended.
    -   **Example:**
        ```json
        {
        	"message": "Admin logout successful"
        }
        ```
-   **Error:**
    -   **Code:** 500 Internal Server Error
        -   **Example:** `{ "name": "Auth Error", "message": "Admin logout failed due to server error" }`

## Config Controller

### Get Configurations

-   **Route:** `GET /call/api/config`
-   **Description:** Retrieves the current system configurations.
-   **Authentication Required:** Yes, basic authentication for user and admin.
-   **Body:** Not required.
-   **Response:** JSON object with the system configurations.
    -   **Example:**
        ```json
        {
        	"videoQuality": "1080p",
        	"maxParticipants": 10,
        	"autoRecording": false
        }
        ```
-   **Error:**
    -   **Code:** 500 Internal Server Error
        -   **Example:** `{ "name": "Config Error", "message": "Failed to retrieve configurations" }`

## Health Controller

### Health Check

-   **Route:** `GET /call/api/healthcheck`
-   **Description:** Checks the health of the API service.
-   **Authentication Required:** Yes, basic authentication for user and admin.
-   **Body:** Not required.
-   **Response:** JSON object indicating the health status.
    -   **Example:**
        ```json
        {
        	"status": "healthy",
        	"timestamp": "2023-01-01T00:00:00Z"
        }
        ```
-   **Error:**
    -   **Code:** 503 Service Unavailable
        -   **Example:** `{ "name": "Health Check Error", "message": "Service is unhealthy" }`
    -   **Code:** 500 Internal Server Error
        -   **Example:** `{ "name": "Health Check Error", "message": "Failed to perform health check" }`
