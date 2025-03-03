import { OpenViduMeetRoom, OpenViduRoomDAO, OpenViduMeetRoomOptions } from '@typings-ce';

type OmitProps<T, K extends keyof T> = Omit<T, K>;
export class OpenViduRoomHelper {
	private static toDAO<T, K extends keyof T>(room: T, propsToOmit: K[]): OmitProps<T, K> {
		const DAO = { ...room };

		for (const prop of propsToOmit) {
			delete DAO[prop];
		}

		return DAO;
	}

	static convertToRoomDAO(room: OpenViduMeetRoom): OpenViduRoomDAO {
		return OpenViduRoomHelper.toDAO(room, ['permissions']);
	}

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
}
