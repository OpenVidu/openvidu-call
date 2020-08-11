import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ChatMessage } from '../../types/chat-type';
import { OpenViduSessionService } from '../openvidu-session/openvidu-session.service';
import { MatSidenav } from '@angular/material/sidenav';
import { RemoteUsersService } from '../remote-users/remote-users.service';
import { LoggerService } from '../logger/logger.service';
import { ILogger } from '../../types/logger-type';
import { NotificationService } from '../notifications/notification.service';

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
		private oVSessionService: OpenViduSessionService,
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
		const session = this.oVSessionService.getWebcamSession();
		session.on('signal:chat', (event: any) => {
			const connectionId = event.from.connectionId;
			const data = JSON.parse(event.data);
			const isMyOwnConnection = this.oVSessionService.isMyOwnConnection(connectionId);
			this.messageList.push({
				isLocal: isMyOwnConnection,
				nickname: data.nickname,
				message: data.message,
				userAvatar: isMyOwnConnection
					? this.oVSessionService.getWebCamAvatar()
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
				nickname: this.oVSessionService.getWebcamUserName()
			};
			const sessionAvailable = this.oVSessionService.getConnectedUserSession();
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
