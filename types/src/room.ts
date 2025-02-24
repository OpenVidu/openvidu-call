interface BaseRoomOptions {
	endDate: number;
	// locked?: boolean;
	// allowRecording?: boolean;
	// allowBroadcasting?: boolean;
}
/**
 * Options for creating or configuring a room.
 */
export interface OpenViduRoomOptions extends BaseRoomOptions {
	roomNamePrefix: string;
}

/**
 * Interface representing the response received when a room is created.
 */
export interface OpenViduRoom extends BaseRoomOptions {
	roomId: string;
	startDate: number;
	roomUrl: string;
}
