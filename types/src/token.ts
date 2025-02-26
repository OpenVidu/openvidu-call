/**
 * Options for creating a participant token.
 */
export interface TokenOptions {
	/**
	 * The name of the room to join.
	 */
	roomName: string;

	/**
	 * The name of the participant.
	 */
	participantName: string;

	/**
	 * Optional permissions for the participant.
	 */
	permissions?: ParticipantPermissions;
}
/**
 * Interface representing the permissions of a participant.
 */
export interface ParticipantPermissions {
	canRecord: boolean;
	canChat: boolean;
	//TODO: Add more permissions as needed
}
