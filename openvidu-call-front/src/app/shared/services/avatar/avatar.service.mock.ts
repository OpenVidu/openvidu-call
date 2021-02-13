import { Injectable } from '@angular/core';
import { LocalUsersService } from '../local-users/local-users.service';
import { AvatarType } from '../../types/chat-type';

@Injectable({
	providedIn: 'root'
})
export class AvatarServiceMock {
	private openviduAvatar = 'assets/images/openvidu_globe.png';
	private capturedAvatar = '';

	constructor() {}

	setCaputedAvatar(avatar: string) {}

	setFinalAvatar(type: AvatarType) {}

	getOpenViduAvatar(): string {
		return this.openviduAvatar;
	}
	getCapturedAvatar(): string {
		return this.capturedAvatar;
	}

	createCapture(): string {
		return '';
	}

	getAvatarFromConnectionData(data: string): string {
		return '';
	}

	clear() {}
}
