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
	 * A secret key for room access.
	 */
	secret: string;
}
