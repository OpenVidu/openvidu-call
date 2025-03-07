import { OpenViduMeetRoom, OpenViduMeetRoomOptions } from '@typings-ce';
import { CreateOptions } from 'livekit-server-sdk';
import { MEET_NAME_ID } from '../environment.js';
import { uid } from 'uid/single';

export class OpenViduRoomHelper {

	/**
	 * Converts an OpenViduMeetRoom object to an OpenViduMeetRoomOptions object.
	 *
	 * @param room - The OpenViduMeetRoom object to convert.
	 * @returns An OpenViduMeetRoomOptions object containing the same properties as the input room.
	 */
	static toOpenViduOptions(room: OpenViduMeetRoom): OpenViduMeetRoomOptions {
		return {
			expirationDate: room.expirationDate,
			maxParticipants: room.maxParticipants,
			preferences: room.preferences,
			roomNamePrefix: room.roomNamePrefix
		};
	}

	static generateLivekitRoomOptions(roomInput: OpenViduMeetRoom | OpenViduMeetRoomOptions): CreateOptions {
		const isOpenViduRoom = 'creationDate' in roomInput;
		const {
			roomName = `${roomInput.roomNamePrefix ?? ''}${uid(15)}`,
			expirationDate,
			maxParticipants,
			creationDate = Date.now()
		} = roomInput as OpenViduMeetRoom;

		const timeUntilExpiration = this.calculateExpirationTime(expirationDate, creationDate);

		return {
			name: roomName,
			metadata: JSON.stringify({
				createdBy: MEET_NAME_ID,
				roomOptions: isOpenViduRoom
					? OpenViduRoomHelper.toOpenViduOptions(roomInput as OpenViduMeetRoom)
					: roomInput
			}),
			emptyTimeout: timeUntilExpiration,
			maxParticipants: maxParticipants || undefined,
			departureTimeout: 31_536_000 // 1 year
		};
	}

	private static calculateExpirationTime(expirationDate: number, creationDate: number): number {
		return Math.max(0, Math.floor((expirationDate - creationDate) / 1000));
	}
}
