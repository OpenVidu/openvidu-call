type StatusError = 400 | 404 | 406 | 409 | 422 | 500 | 503;
export class OpenViduMeetError extends Error {
	name: string;
	statusCode: StatusError;
	constructor(error: string, message: string, statusCode: StatusError) {
		super(message);
		this.name = error;
		this.statusCode = statusCode;
	}
}

// General errors

export const errorLivekitIsNotAvailable = (): OpenViduMeetError => {
	return new OpenViduMeetError('LiveKit Error', 'LiveKit is not available', 503);
};

export const errorS3NotAvailable = (error: any): OpenViduMeetError => {
	return new OpenViduMeetError('S3 Error', `S3 is not available ${error}`, 503);
}

export const internalError = (error: any): OpenViduMeetError => {
	return new OpenViduMeetError('Unexpected error', `Something went wrong ${error}`, 500);
};

export const errorRequest = (error: string): OpenViduMeetError => {
	return new OpenViduMeetError('Wrong request', `Problem with some body parameter. ${error}`, 400);
};

export const errorUnprocessableParams = (error: string): OpenViduMeetError => {
	return new OpenViduMeetError('Wrong request', `Some parameters are not valid. ${error}`, 422);
};

// Recording errors

export const errorRecordingNotFound = (recordingId: string): OpenViduMeetError => {
	return new OpenViduMeetError('Recording Error', `Recording ${recordingId} not found`, 404);
};

export const errorRecordingNotStopped = (recordingId: string): OpenViduMeetError => {
	return new OpenViduMeetError('Recording Error', `Recording ${recordingId} is not stopped yet`, 409);
};

export const errorRecordingNotReady = (recordingId: string): OpenViduMeetError => {
	return new OpenViduMeetError('Recording Error', `Recording ${recordingId} is not ready yet`, 409);
};

export const errorRecordingAlreadyStopped = (recordingId: string): OpenViduMeetError => {
	return new OpenViduMeetError('Recording Error', `Recording ${recordingId} is already stopped`, 409);
};

export const errorRecordingAlreadyStarted = (roomName: string): OpenViduMeetError => {
	return new OpenViduMeetError('Recording Error', `The room '${roomName}' is already being recorded`, 409);
};


// Broadcasting errors

export const errorSessionWithoutParticipants = (roomName: string): OpenViduMeetError => {
	return new OpenViduMeetError('Broadcasting Error', `The room '${roomName}' does not have participants`, 406);
};

export const errorBroadcastingAlreadyStarted = (roomName: string): OpenViduMeetError => {
	return new OpenViduMeetError('Broadcasting Error', `The room '${roomName}' is already being broadcasted`, 409);
};

export const errorBroadcastingNotStarted = (roomName: string): OpenViduMeetError => {
	return new OpenViduMeetError('Broadcasting Error', `The room '${roomName}' is not being broadcasted`, 409);
};

// Room errors
export const errorRoomNotFound = (roomName: string): OpenViduMeetError => {
	return new OpenViduMeetError('Room Error', `The room '${roomName}' does not exist`, 404);
};

// Participant errors

export const errorParticipantNotFound = (participantName: string, roomName: string): OpenViduMeetError => {
	return new OpenViduMeetError(
		'Participant Error',
		`'${participantName}' not found in room '${roomName}'`,
		404
	);
};

export const errorParticipantAlreadyExists = (participantName: string, roomName: string): OpenViduMeetError => {
	return new OpenViduMeetError(
		'Room Error',
		`'${participantName}' already exists in room in ${roomName}`,
		409
	);
};
