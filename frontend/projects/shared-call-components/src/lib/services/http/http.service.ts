import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OpenViduMeetRoom, OpenViduMeetRoomOptions } from '@lib/typings/ce/room';
import { GlobalPreferences, RoomPreferences, TokenOptions } from '@typings-ce';
import { RecordingInfo, Room } from 'openvidu-components-angular';
import { lastValueFrom } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class HttpService {
	// private baseHref: string;
	protected pathPrefix = 'meet/api';
	protected apiVersion = 'v1';

	constructor(protected http: HttpClient) {}

	createRoom(options: OpenViduMeetRoomOptions): Promise<OpenViduMeetRoom> {
		return this.postRequest(`${this.pathPrefix}/${this.apiVersion}/rooms`, options);
	}

	deleteRoom(roomName: string): Promise<any> {
		return this.deleteRequest(`${this.pathPrefix}/${this.apiVersion}/rooms/${roomName}`);
	}

	listRooms(): Promise<OpenViduMeetRoom[]> {
		//TODO: Add 'fields' query param for filtering rooms by fields
		return this.getRequest(`${this.pathPrefix}/${this.apiVersion}/rooms`);
	}

	getRoom(roomName: string): Promise<OpenViduMeetRoom> {
		return this.getRequest(`${this.pathPrefix}/${this.apiVersion}/rooms/${roomName}`);
	}

	generateParticipantToken(tokenOptions: TokenOptions): Promise<{ token: string }> {
		return this.postRequest(`${this.pathPrefix}/participants/token`, tokenOptions);
	}

	/**
	 * Retrieves the global preferences.
	 *
	 * @returns {Promise<GlobalPreferences>} A promise that resolves to the global preferences.
	 */
	getGlobalPreferences(): Promise<GlobalPreferences> {
		return this.getRequest(`${this.pathPrefix}/${this.apiVersion}/preferences`);
	}

	/**
	 * Retrieves the room preferences.
	 *
	 * @returns {Promise<RoomPreferences>} A promise that resolves to the room preferences.
	 */
	getRoomPreferences(): Promise<RoomPreferences> {
		return this.getRequest(`${this.pathPrefix}/${this.apiVersion}/preferences/room`);
	}

	/**
	 * Saves the room preferences.
	 *
	 * @param preferences - The room preferences to be saved.
	 * @returns A promise that resolves when the preferences have been successfully saved.
	 */
	saveRoomPreferences(preferences: RoomPreferences): Promise<any> {
		return this.putRequest(`${this.pathPrefix}/preferences/room`, preferences);
	}

	adminLogin(body: { username: string; password: string }): Promise<{ message: string }> {
		return this.postRequest(`${this.pathPrefix}/${this.apiVersion}/auth/admin/login`, body);
	}

	adminLogout(): Promise<{ message: string }> {
		return this.postRequest(`${this.pathPrefix}/${this.apiVersion}/auth/admin/logout`);
	}

	adminRefresh(): Promise<{ message: string }> {
		return this.postRequest(`${this.pathPrefix}/${this.apiVersion}/auth/admin/refresh`);
	}

	adminVerify(): Promise<{ message: string }> {
		return this.getRequest(`${this.pathPrefix}/${this.apiVersion}/auth/admin/verify`);
	}

	userLogin(body: { username: string; password: string }): Promise<{ message: string }> {
		return this.postRequest(`${this.pathPrefix}/${this.apiVersion}/auth/login`, body);
	}

	userLogout(): Promise<{ message: string }> {
		return this.postRequest(`${this.pathPrefix}/${this.apiVersion}/auth/logout`);
	}

	getRecordings(continuationToken?: string): Promise<{ recordings: RecordingInfo[]; continuationToken: string }> {
		let path = `${this.pathPrefix}/${this.apiVersion}/recordings`;

		if (continuationToken) {
			path += `?continuationToken=${continuationToken}`;
		}

		return this.getRequest(path);
	}

	startRecording(roomName: string): Promise<RecordingInfo> {
		return this.postRequest(`${this.pathPrefix}/${this.apiVersion}/recordings`, { roomName });
	}

	stopRecording(recordingId: string): Promise<RecordingInfo> {
		return this.putRequest(`${this.pathPrefix}/${this.apiVersion}/recordings/${recordingId}`);
	}

	deleteRecording(recordingId: string): Promise<RecordingInfo> {
		return this.deleteRequest(`${this.pathPrefix}/${this.apiVersion}/recordings/${recordingId}`);
	}

	startBroadcasting(roomName: string, broadcastUrl: string): Promise<any> {
		return this.postRequest(`${this.pathPrefix}/${this.apiVersion}/broadcasts/`, { roomName, broadcastUrl });
	}

	stopBroadcasting(broadcastId: string): Promise<any> {
		return this.putRequest(`${this.pathPrefix}/${this.apiVersion}/broadcasts/${broadcastId}`, {});
	}

	protected getRequest<T>(path: string): Promise<T> {
		return lastValueFrom(this.http.get<T>(path));
	}

	protected postRequest<T>(path: string, body: any = {}): Promise<T> {
		return lastValueFrom(this.http.post<T>(path, body));
	}

	protected putRequest<T>(path: string, body: any = {}): Promise<T> {
		return lastValueFrom(this.http.put<T>(path, body));
	}

	protected deleteRequest<T>(path: string): Promise<T> {
		return lastValueFrom(this.http.delete<T>(path));
	}
}
