import { RoomPermissions } from './permissions/room-roles.js';
import { RoomPreferences } from './room-preferences.js';

interface BaseRoomOptions {
	expirationDate: number;
	roomNamePrefix?: string;
	preferences?: RoomPreferences;
	maxParticipants?: number;
}
/**
 * Options for creating or configuring a room.
 */
export type OpenViduRoomOptions = BaseRoomOptions;

/**
 * Interface representing the response received when a room is created.
 */
export interface OpenViduRoom extends BaseRoomOptions {
	roomName: string;
	creationDate: number;
	moderatorRoomUrl: string;
	publisherRoomUrl: string;
	viewerRoomUrl: string;
	permissions: RoomPermissions;
}

export type OpenViduRoomDAO = Omit<OpenViduRoom, 'permissions'>;
