import { LiveKitPermissions } from './permissions/livekit-permissions.js';
import { OpenViduMeetPermissions } from './permissions/openvidu-permissions.js';

/**
 * Represents the permissions for an individual participant.
 */
export interface ParticipantPermissions {
	livekit: LiveKitPermissions;
	openvidu: OpenViduMeetPermissions;
}

/**
 * Represents the role of a participant in a room.
 */
export const enum ParticipantRole {
	MODERATOR = 'moderator',
	PUBLISHER = 'publisher',
	VIEWER = 'viewer',
}
