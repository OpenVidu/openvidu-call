import { ParticipantPermissions } from './participant.js';

/**
 * Defines the roles in the room and their permissions.
 */
export interface RoomPermissions {
	moderator: ParticipantPermissions;
	publisher: ParticipantPermissions;
	viewer: ParticipantPermissions;
}
