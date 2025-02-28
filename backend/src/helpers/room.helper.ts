import { OpenViduRoom, OpenViduRoomDAO, OpenViduRoomOptions } from '@typings-ce';

type OmitProps<T, K extends keyof T> = Omit<T, K>;
export class OpenViduRoomHelper {
	private static toDAO<T, K extends keyof T>(room: T, propsToOmit: K[]): OmitProps<T, K> {
		const DAO = { ...room };

		for (const prop of propsToOmit) {
			delete DAO[prop];
		}

		return DAO;
	}

	static toOpenViduRoomDAO(room: OpenViduRoom): OpenViduRoomDAO {
		return OpenViduRoomHelper.toDAO(room, ['permissions']);
	}

	/**
	 * Converts an OpenViduRoom object to an OpenViduRoomOptions object.
	 *
	 * @param room - The OpenViduRoom object to convert.
	 * @returns An OpenViduRoomOptions object containing the same properties as the input room.
	 */
	static toOpenViduOptions(room: OpenViduRoom): OpenViduRoomOptions {
		return {
			expirationDate: room.expirationDate,
			maxParticipants: room.maxParticipants,
			preferences: room.preferences,
			roomNamePrefix: room.roomNamePrefix
		};
	}
}
