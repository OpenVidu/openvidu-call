export type WebComponentMessage = ParentMessage | OpenViduMeetMessage;

/**
 * Message sent from the parent to the OpenViduMeet component.
 */
export interface ParentMessage {
	action: WebComponentActionType;
	payload?: Record<string, any>;
}

/**
 * Message sent from the OpenViduMeet component to the parent.
 */
export interface OpenViduMeetMessage {
	eventType: WebComponentEventType;
	payload?: Record<string, unknown>;
}

export enum WebComponentActionType {
	INITIALIZE = 'initialize',
	END_MEETING = 'endMeeting',
	LEAVE_ROOM = 'leaveRoom',
	TOGGLE_CHAT = 'toggleChat'
}

export enum WebComponentEventType {
	ROOM_CREATED = 'room-created',
	PARTICIPANT_LEFT = 'participant-left'
}
