import { LiveKitPermissions } from './livekit-permissions.js';
import { OpenViduMeetPermissions } from './openvidu-permissions.js';

/**
 * Represents the permissions for an individual participant.
 */
export interface ParticipantPermissions {
	livekit: LiveKitPermissions;
	openvidu: OpenViduMeetPermissions;
}

/*
 * Represents the role of a participant in a room.
 */
export enum ParticipantRole {
	MODERATOR = 'moderator',
	PUBLISHER = 'publisher',
	VIEWER = 'viewer',
}
