import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Publisher } from 'openvidu-browser/lib/OpenVidu/Publisher';
import { UserModel } from '../../models/user-model';
import { AvatarType } from '../../types/chat-type';

@Injectable({
	providedIn: 'root'
})
export class LocalUsersServiceMock {
	OVUsers: Observable<UserModel[]>;
	screenShareState: Observable<boolean>;
	webcamVideoActive: Observable<boolean>;
	private _OVUsers = <BehaviorSubject<UserModel[]>>new BehaviorSubject([]);
	private _screenShareState = <BehaviorSubject<boolean>>new BehaviorSubject(false);
	private _webcamVideoActive = <BehaviorSubject<boolean>>new BehaviorSubject(true);
	private webcamUser: UserModel = null;
	private screenUser: UserModel = null;

	constructor() {
		this.OVUsers = this._OVUsers.asObservable();
		this.screenShareState = this._screenShareState.asObservable();
		this.webcamVideoActive = this._webcamVideoActive.asObservable();
	}

	initialize() {}

	getWebcamPublisher(): Publisher {
		return null;
	}

	setWebcamPublisher(publisher: Publisher) {}

	getScreenPublisher(): Publisher {
		return null;
	}

	setScreenPublisher(publisher: Publisher) {}

	enableWebcamUser() {}

	disableWebcamUser() {}

	enableScreenUser(screenPublisher: Publisher) {}

	disableScreenUser() {}

	updateUsersStatus() {}

	clear() {}

	isWebCamEnabled(): boolean {
		return false;
	}

	isOnlyScreenConnected(): boolean {
		return false;
	}

	hasWebcamVideoActive(): boolean {
		return false;
	}

	hasWebcamAudioActive(): boolean {
		return false;
	}

	hasScreenAudioActive(): boolean {
		return false;
	}

	areBothConnected(): boolean {
		return false;
	}

	isOnlyWebcamConnected(): boolean {
		return false;
	}

	isScreenShareEnabled(): boolean {
		return false;
	}

	setWebcamAvatar() {}

	setAvatar(option: AvatarType, avatar?: string): void {}

	updateUsersNickname(nickname: string) {}

	getWebcamAvatar(): string {
		return '';
	}

	getWebcamUserName(): string {
		return '';
	}

	getScreenUserName() {}

	resetUsersZoom() {}

	toggleZoom(connectionId: string) {}
}
