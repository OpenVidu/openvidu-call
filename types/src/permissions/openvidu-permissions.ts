/**
 * Defines OpenVidu-specific permissions for a participant.
 */
export interface OpenViduMeetPermissions {
	// Permissions for broadcasting
	canBroadcast: boolean; // Allow broadcasting to the room.
	canPublishScreen: boolean; // Can publish screen sharing.

	// Permissions for recording
	canRecord: boolean; // Can start/stop recording the room.
	// canWatchRecording?: boolean; // Can watch the recording.
	// canDownloadRecording?: boolean; // Can download the recording.
	// canDeleteRecording?: boolean; // Can delete the recording.

	// Permissions for chat
	canChat: boolean; // Can send chat messages in the room.

	canChangeVirtualBackground: boolean; // Can change the virtual background.
}
