/**
 * Options for creating an embedded token.
 */
export interface EmbeddedTokenOptions {
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
	permissions?: EmbeddedParticipantPermissions;
}
/**
 * Interface representing the permissions of an embedded participant.
 */
export interface EmbeddedParticipantPermissions {
	canRecord: boolean;
	canChat: boolean;
	//TODO: Add more permissions as needed
}
