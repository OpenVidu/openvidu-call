import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserModel } from '../../models/user-model';
import { StreamEvent, Subscriber } from 'openvidu-browser';
import { LoggerService } from '../logger/logger.service';
import { ILogger } from '../../types/logger-type';

@Injectable({
	providedIn: 'root'
})
export class RemoteUsersService {

	remoteUsers: Observable<UserModel[]>;
	private _remoteUsers = <BehaviorSubject<UserModel[]>>new BehaviorSubject([]);

	private users: UserModel[] = [];

	private log: ILogger;

	constructor(private loggerSrv: LoggerService) {
		this.log = this.loggerSrv.get('RemoteService');
		this.remoteUsers = this._remoteUsers.asObservable();
	}

	updateUsers() {
		this._remoteUsers.next(this.users);
	}

	add(event: StreamEvent, subscriber: Subscriber) {
		const connectionId = event.stream.connection.connectionId;
		const nickname = JSON.parse(event.stream.connection.data)?.clientData;
		const newUser = new UserModel(connectionId, subscriber, nickname);

		this.users.push(newUser);
		this.updateUsers();
	}

	removeUserByConnectionId(connectionId: string) {
		this.log.w('Deleting user: ', connectionId);
		const user = this.getRemoteUserByConnectionId(connectionId);
		const index = this.users.indexOf(user, 0);
		if (index > -1) {
			this.users.splice(index, 1);
			this.updateUsers();
		}
	}

	someoneIsSharingScreen(): boolean {
		return this.users.some(user => user.isScreen());
	}

	toggleUserZoom(connectionId: string) {
		const user = this.getRemoteUserByConnectionId(connectionId);
		user.setVideoSizeBig(!user.isVideoSizeBig());
	}

	resetUsersZoom() {
		this.users.forEach(u => u.setVideoSizeBig(false));
	}

	setUserZoom(connectionId: string, zoom: boolean) {
		this.getRemoteUserByConnectionId(connectionId)?.setVideoSizeBig(zoom);
	}

	getRemoteUserByConnectionId(connectionId: string): UserModel {
		return this.users.filter(u => u.getConnectionId() === connectionId)[0];
	}

	clean() {
		this._remoteUsers = <BehaviorSubject<UserModel[]>>new BehaviorSubject([]);
		this.remoteUsers = this._remoteUsers.asObservable();
		this.users = [];
	}
}
