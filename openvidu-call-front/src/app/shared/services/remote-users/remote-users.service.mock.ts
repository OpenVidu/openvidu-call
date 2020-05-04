import { Injectable } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { StreamEvent, Subscriber } from 'openvidu-browser';

@Injectable({
	providedIn: 'root'
})
export class RemoteUsersServiceMock {
	constructor() {}

	updateUsers() {}

	add(event: StreamEvent, subscriber: Subscriber) {}

	removeUserByConnectionId(connectionId: string) {}

	someoneIsSharingScreen(): boolean {
		return false;
	}

	toggleUserZoom(connectionId: string) {}

	resetUsersZoom() {}

	setUserZoom(connectionId: string, zoom: boolean) {}

	getRemoteUserByConnectionId(connectionId: string): UserModel {
		return null;
	}

	updateNickname(connectionId: any, nickname: any) {}

	clean() {}

	getUserAvatar(connectionId: string): string {
		return 'avatar';
	}
}
