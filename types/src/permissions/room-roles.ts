import { LiveKitPermissions } from './livekit-permissions.js';
import { OpenViduMeetPermissions } from './openvidu-permissions.js';

/**
 * Defines the roles in the room and their permissions.
 */
export interface RoomPermissions {
	moderator: ParticipantPermissions;
	publisher: ParticipantPermissions;
	viewer: ParticipantPermissions;
}

/**
 * Represents the permissions for an individual participant.
 */
export interface ParticipantPermissions {
	livekit: LiveKitPermissions;
	openvidu: OpenViduMeetPermissions;
}
