import { Injectable } from '@angular/core';
import { PublisherProperties, Publisher, Session } from 'openvidu-browser';
import { AvatarType } from '../../types/chat-type';
import { Observable } from 'rxjs/internal/Observable';
import { UserModel } from '../../models/user-model';

@Injectable({
	providedIn: 'root'
})
export class OpenViduSessionServiceMock {


	OVUsers: Observable<UserModel[]>;


	constructor() {}

	initialize() {}

	initSessions() {}

	getWebcamSession(): Session {
		return null;
	}

	getConnectedUserSession(): Session {
		return null;
	}

	getScreenSession(): Session {
		return null;
	}

	async connectWebcamSession(token: string): Promise<any> {
		return null;
	}

	async connectScreenSession(token: string): Promise<any> {
		return null;
	}

	async publishWebcam(): Promise<any> {
		return null;
	}

	async publishScreen(): Promise<any> {
		return null;
	}

	unpublishWebcam() {}

	unpublishScreen() {}

	enableWebcamUser() {}

	disableWebcamUser() {}

	enableScreenUser(screenPublisher: Publisher) {}

	disableScreenUser() {}

	initCamPublisher(targetElement: string | HTMLElement, properties: PublisherProperties): Publisher {
		return null;
	}

	publishVideo(isVideoActive: boolean) {}

	publishWebcamAudio(audio: boolean) {}

	publishScreenAudio(audio: boolean) {}

	replaceTrack(videoSource: string, audioSource: string, mirror: boolean = true) {}

	async replaceScreenTrack() {}

	initScreenPublisher(targetElement: string | HTMLElement, properties: PublisherProperties): Publisher {
		return null;
	}

	destroyUsers() {}

	disconnect() {}

	isWebCamEnabled(): boolean {
		return null;
	}

	isOnlyScreenConnected(): boolean {
		return null;
	}

	hasWebcamVideoActive(): boolean {
		return null;
	}

	hasWebcamAudioActive(): boolean {
		return null;
	}

	hasScreenAudioActive(): boolean {
		return null;
	}

	areBothConnected(): boolean {
		return null;
	}

	isOnlyWebcamConnected(): boolean {
		return null;
	}

	isScreenShareEnabled(): boolean {
		return null;
	}

	isMyOwnConnection(connectionId: string): boolean {
		return null;
	}

	createProperties(
		videoSource: string | MediaStreamTrack | boolean,
		audioSource: string | MediaStreamTrack | boolean,
		publishVideo: boolean,
		publishAudio: boolean,
		mirror: boolean
	): PublisherProperties {
		return null;
	}

	setSessionId(sessionId: string) {}

	getSessionId(): string {
		return null;
	}

	setWebcamAvatar() {}

	setAvatar(option: AvatarType, avatar?: string): void {}

	setWebcamName(nickname: string) {
		return null;
	}

	getWebCamAvatar(): string {
		return null;
	}

	getWebcamUserName(): string {
		return null;
	}

	getScreenUserName() {}

	resetUsersZoom() {}

	toggleZoom(connectionId: string) {}
}
