import { GlobalPreferences, OpenViduMeetRoom } from '@typings-ce';

/**
 * Interface for managing global preferences storage.
 */

export interface PreferencesStorage<
	T extends GlobalPreferences = GlobalPreferences,
	R extends OpenViduMeetRoom = OpenViduMeetRoom
> {
	/**
	 * Initializes the storage with default preferences if they are not already set.
	 *
	 * @param defaultPreferences - The default preferences to initialize with.
	 * @returns A promise that resolves when the initialization is complete.
	 */
	initialize(defaultPreferences: T): Promise<void>;

	/**
	 * Retrieves the global preferences of Openvidu Meet.
	 *
	 * @returns A promise that resolves to the global preferences, or null if not set.
	 */
	getGlobalPreferences(): Promise<T | null>;

	/**
	 * Saves the given preferences.
	 *
	 * @param preferences - The preferences to save.
	 * @returns A promise that resolves to the saved preferences.
	 */
	saveGlobalPreferences(preferences: T): Promise<T>;

	getOpenViduRooms(): Promise<R[]>;

	/**
	 * Retrieves the {@link OpenViduMeetRoom}.
	 *
	 * @param roomName - The name of the room to retrieve.
	 * @returns A promise that resolves to the OpenVidu Room, or null if not found.
	 **/
	getOpenViduRoom(roomName: string): Promise<R | null>;

	/**
	 * Saves the OpenVidu Room.
	 *
	 * @param ovRoom - The OpenVidu Room to save.
	 * @returns A promise that resolves to the saved
	 **/
	saveOpenViduRoom(ovRoom: R): Promise<R>;

	/**
	 * Deletes the OpenVidu Room for a given room name.
	 *
	 * @param roomName - The name of the room whose should be deleted.
	 * @returns A promise that resolves when the room have been deleted.
	 **/
	deleteOpenViduRoom(roomName: string): Promise<void>;
}
