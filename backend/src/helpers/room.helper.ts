import { OpenViduRoom, OpenViduRoomDAO } from '@typings-ce';

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
}
