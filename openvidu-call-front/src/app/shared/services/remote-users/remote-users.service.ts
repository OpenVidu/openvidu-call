import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserModel } from '../../models/user-model';
import { StreamEvent, Subscriber, ConnectionEvent } from 'openvidu-browser';
import { LoggerService } from '../logger/logger.service';
import { ILogger } from '../../types/logger-type';
import { UtilsService } from '../utils/utils.service';
import { UserName } from '../../types/username-type';

@Injectable({
	providedIn: 'root'
})
export class RemoteUsersService {

	remoteUsers: Observable<UserModel[]>;
	remoteUserNameList: Observable<UserName[]>;
	private _remoteUsers = <BehaviorSubject<UserModel[]>>new BehaviorSubject([]);
	private _remoteUserNameList = <BehaviorSubject<UserName[]>>new BehaviorSubject([]);

	private users: UserModel[] = [];

	private log: ILogger;

	constructor(private loggerSrv: LoggerService, private utilsSrv: UtilsService) {
		this.log = this.loggerSrv.get('RemoteService');
		this.remoteUsers = this._remoteUsers.asObservable();
		this.remoteUserNameList = this._remoteUserNameList.asObservable();
	}

	updateUsers() {
		this._remoteUsers.next(this.users);
	}

	add(event: StreamEvent | ConnectionEvent, subscriber: Subscriber) {
		let nickname = '';
		let avatar = '';
		const connectionId = (<StreamEvent>event)?.stream?.connection?.connectionId || (<ConnectionEvent>event)?.connection?.connectionId;
		const data = (<StreamEvent>event)?.stream?.connection?.data || (<ConnectionEvent>event)?.connection?.data;
		nickname = this.utilsSrv.getNicknameFromConnectionData(data);
		avatar = this.utilsSrv.getAvatarFromConnectionData(data);
		const newUser = new UserModel(connectionId, subscriber, nickname);
		newUser.setUserAvatar(avatar);
		// Add new user (connectionCreated Event) or assign the streamManager to old user when the connnectionId exists (streamCreated Event)
		this.addUser(newUser);
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
		return this.users.find(u => u.getConnectionId() === connectionId);
	}

	updateNickname(connectionId: any, nickname: any) {
		const user = this.getRemoteUserByConnectionId(connectionId);
		user?.setNickname(nickname);
		this._remoteUsers.next(this.users);

		// Update nickname in remote nickname list
		const remoteUserNameList = this._remoteUserNameList.getValue();
		remoteUserNameList.forEach(element => {
			if (element.connectionId === connectionId) {
				element.nickname = nickname;
				return;
			}
		});
		this._remoteUserNameList.next(remoteUserNameList);
	}


	clean() {
		this._remoteUsers = <BehaviorSubject<UserModel[]>>new BehaviorSubject([]);
		this.remoteUsers = this._remoteUsers.asObservable();
		this._remoteUserNameList = <BehaviorSubject<UserName[]>>new BehaviorSubject([]);
		this.remoteUserNameList = this._remoteUserNameList.asObservable();
		this.users = [];
	}

	getUserAvatar(connectionId: string): string {
		return this.getRemoteUserByConnectionId(connectionId)?.getAvatar() || this.utilsSrv.getOpenViduAvatar();
	}

	addUserName(event: ConnectionEvent) {

		const nickname  = this.utilsSrv.getNicknameFromConnectionData(event.connection.data);
		const connectionId = event.connection.connectionId;
		const newUserNameList = this._remoteUserNameList.getValue();

		newUserNameList.push({nickname, connectionId});
		this._remoteUserNameList.next(newUserNameList);
	}

	deleteUserName(event: ConnectionEvent) {
		const oldUserNameList: UserName[] = this._remoteUserNameList.getValue();
		const newUserNameList: UserName[] = oldUserNameList.filter(element => element.connectionId !== event.connection.connectionId);

		this._remoteUserNameList.next(newUserNameList);
	}

	private addUser(user: UserModel) {
		const oldUser = this.getRemoteUserByConnectionId(user.connectionId);

		// Assign streamManager if user exists due to connectionCreated Event
		if (!!oldUser) {
			oldUser.setStreamManager(user.getStreamManager());
			return;
		}

		this.users.push(user);
	}
}
