type StatusError = 400 | 404 | 406 | 409 | 422 | 500 | 503;
export class OpenViduCallError extends Error {
	name: string;
	statusCode: StatusError;
	constructor(error: string, message: string, statusCode: StatusError) {
		super(message);
		this.name = error;
		this.statusCode = statusCode;
	}
}

// General errors

export const errorLivekitIsNotAvailable = (): OpenViduCallError => {
	return new OpenViduCallError('LiveKit Error', 'LiveKit is not available', 503);
};

export const errorS3NotAvailable = (error: any): OpenViduCallError => {
	return new OpenViduCallError('S3 Error', `S3 is not available ${error}`, 503);
}

export const internalError = (error: any): OpenViduCallError => {
	return new OpenViduCallError('Unexpected error', `Something went wrong ${error}`, 500);
};

export const errorRequest = (error: string): OpenViduCallError => {
	return new OpenViduCallError('Wrong request', `Problem with some body parameter. ${error}`, 400);
};

export const errorUnprocessableParams = (error: string): OpenViduCallError => {
	return new OpenViduCallError('Wrong request', `Some parameters are not valid. ${error}`, 422);
};

// Recording errors

export const errorRecordingNotFound = (recordingId: string): OpenViduCallError => {
	return new OpenViduCallError('Recording Error', `Recording ${recordingId} not found`, 404);
};

export const errorRecordingNotStopped = (recordingId: string): OpenViduCallError => {
	return new OpenViduCallError('Recording Error', `Recording ${recordingId} is not stopped yet`, 409);
};

export const errorRecordingNotReady = (recordingId: string): OpenViduCallError => {
	return new OpenViduCallError('Recording Error', `Recording ${recordingId} is not ready yet`, 409);
};

export const errorRecordingAlreadyStopped = (recordingId: string): OpenViduCallError => {
	return new OpenViduCallError('Recording Error', `Recording ${recordingId} is already stopped`, 409);
};

export const errorRecordingAlreadyStarted = (roomName: string): OpenViduCallError => {
	return new OpenViduCallError('Recording Error', `The room '${roomName}' is already being recorded`, 409);
};


// Broadcasting errors

export const errorSessionWithoutParticipants = (roomName: string): OpenViduCallError => {
	return new OpenViduCallError('Broadcasting Error', `The room '${roomName}' does not have participants`, 406);
};

export const errorBroadcastingAlreadyStarted = (roomName: string): OpenViduCallError => {
	return new OpenViduCallError('Broadcasting Error', `The room '${roomName}' is already being broadcasted`, 409);
};

export const errorBroadcastingNotStarted = (roomName: string): OpenViduCallError => {
	return new OpenViduCallError('Broadcasting Error', `The room '${roomName}' is not being broadcasted`, 409);
};

// Room errors
export const errorRoomNotFound = (roomName: string): OpenViduCallError => {
	return new OpenViduCallError('Room Error', `The room '${roomName}' does not exist`, 404);
};

export const errorParticipantAlreadyExists = (participantName: string, roomName: string): OpenViduCallError => {
	return new OpenViduCallError(
		'Room Error',
		`'${participantName}' already exists in room in ${roomName}`,
		409
	);
};
