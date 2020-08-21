import { Injectable } from '@angular/core';
import { ChatMessage } from '../../types/chat-type';
import { MatSidenav } from '@angular/material/sidenav';
import { RemoteUsersService } from '../remote-users/remote-users.service';
import { LoggerService } from '../logger/logger.service';
import { ILogger } from '../../types/logger-type';
import { NotificationService } from '../notifications/notification.service';
import { OpenViduWebrtcService } from '../openvidu-webrtc/openvidu-webrtc.service';
import { LocalUsersService } from '../local-users/local-users.service';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
	providedIn: 'root'
})
export class ChatService {
	messagesObs: Observable<ChatMessage[]>;
	messagesUnreadObs: Observable<number>;
	toggleChatObs: Observable<boolean>;

	private chatComponent: MatSidenav;

	private _messageList = <BehaviorSubject<ChatMessage[]>>new BehaviorSubject([]);
	private _toggleChat = <BehaviorSubject<boolean>>new BehaviorSubject(false);

	private messageList: ChatMessage[] = [];
	private chatOpened: boolean;
	private messagesUnread = 0;
	private log: ILogger;

	private _messagesUnread = <BehaviorSubject<number>>new BehaviorSubject(0);

	constructor(
		private loggerSrv: LoggerService,
		private openViduWebRTCService: OpenViduWebrtcService,
		private localUsersService: LocalUsersService,
		private remoteUsersService: RemoteUsersService,
		private notificationService: NotificationService
	) {
		this.log = this.loggerSrv.get('ChatService');
		this.messagesObs = this._messageList.asObservable();
		this.toggleChatObs = this._toggleChat.asObservable();
		this.messagesUnreadObs = this._messagesUnread.asObservable();
	}

	setChatComponent(chatSidenav: MatSidenav) {
		this.chatComponent = chatSidenav;
	}

	subscribeToChat() {
		const session = this.openViduWebRTCService.getWebcamSession();
		session.on('signal:chat', (event: any) => {
			const connectionId = event.from.connectionId;
			const data = JSON.parse(event.data);
			const isMyOwnConnection = this.openViduWebRTCService.isMyOwnConnection(connectionId);
			this.messageList.push({
				isLocal: isMyOwnConnection,
				nickname: data.nickname,
				message: data.message,
				userAvatar: isMyOwnConnection
					? this.localUsersService.getAvatar()
					: this.remoteUsersService.getUserAvatar(connectionId)
			});
			if (!this.isChatOpened()) {
				this.addMessageUnread();
				this.notificationService.newMessage(data.nickname.toUpperCase(), this.toggleChat.bind(this));
			}
			this._messageList.next(this.messageList);
		});
	}

	sendMessage(message: string) {
		message = message.replace(/ +(?= )/g, '');
		if (message !== '' && message !== ' ') {
			const data = {
				message: message,
				nickname: this.localUsersService.getWebcamUserName()
			};
			const sessionAvailable = this.openViduWebRTCService.getSessionOfUserConnected();
			sessionAvailable.signal({
				data: JSON.stringify(data),
				type: 'chat'
			});
		}
	}

	toggleChat() {
		this.log.d('Toggling chat');
		this.chatComponent.toggle().then(() => {
			this.chatOpened = this.chatComponent.opened;
			this._toggleChat.next(this.chatOpened);
			if (this.chatOpened) {
				this.messagesUnread = 0;
				this._messagesUnread.next(this.messagesUnread);
			}
		});
	}

	private isChatOpened(): boolean {
		return this.chatOpened;
	}

	private addMessageUnread() {
		this.messagesUnread++;
		this._messagesUnread.next(this.messagesUnread);
	}
}
