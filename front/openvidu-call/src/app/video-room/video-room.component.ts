import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
	Publisher,
	Subscriber,
	Session,
	SignalOptions,
	StreamEvent,
	StreamPropertyChangedEvent,
	SessionDisconnectedEvent,
	PublisherSpeakingEvent
} from 'openvidu-browser';
import { OpenViduLayout, OpenViduLayoutOptions } from '../shared/layout/openvidu-layout';
import { UserModel } from '../shared/models/user-model';
import { NetworkService } from '../shared/services/network/network.service';
import { ChatComponent } from '../shared/components/chat/chat.component';
import { OvSettings } from '../shared/types/ov-settings';
import { UtilsService } from '../shared/services/utils/utils.service';
import { OpenViduSessionService } from '../shared/services/openvidu-session/openvidu-session.service';
import { Subscription } from 'rxjs';
import { ScreenType } from '../shared/types/video-type';
import { LoggerService } from '../shared/services/logger/logger.service';
import { ILogger } from '../shared/types/logger-type';
import { LayoutType } from '../shared/types/layout-type';

@Component({
	selector: 'app-video-room',
	templateUrl: './video-room.component.html',
	styleUrls: ['./video-room.component.css']
})
export class VideoRoomComponent implements OnInit, OnDestroy {
	// webComponent's inputs and outputs
	@Input() ovSettings: OvSettings;
	@Input() sessionName: string;
	@Input() user: string;
	@Input() openviduServerUrl: string;
	@Input() openviduSecret: string;
	@Input() tokens: string[];
	@Input() theme: string;
	@Input() isWebComponent: boolean;
	@Output() joinSession = new EventEmitter<any>();
	@Output() leaveSession = new EventEmitter<any>();
	@Output() error = new EventEmitter<any>();

	@ViewChild('chatComponent') chatComponent: ChatComponent;
	@ViewChild('sidenav') chat: any;

	// Variables
	compact = false;
	sidenavMode: 'side' | 'over' = 'side';
	lightTheme: boolean;
	chatOpened: boolean;
	showDialogExtension = false;
	showConfigRoomCard = true;
	session: Session;
	sessionScreen: Session;
	openviduLayout: OpenViduLayout;
	openviduLayoutOptions: OpenViduLayoutOptions;
	mySessionId: string;
	myUserName: string;
	localUsers: UserModel[] = [];
	remoteUsers: UserModel[] = [];
	messageList: { connectionId: string; nickname: string; message: string; userAvatar: string }[] = [];
	newMessages = 0;
	isConnectionLost: boolean;
	isAutoLayout: boolean;
	private log: ILogger;
	private oVUsersSubscription: Subscription;

	constructor(
		private networkSrv: NetworkService,
		private router: Router,
		private utilsSrv: UtilsService,
		private oVSessionService: OpenViduSessionService,
		private loggerSrv: LoggerService
	) {
		this.log = this.loggerSrv.get('VideoRoomComponent');
	}

	@HostListener('window:beforeunload')
	beforeunloadHandler() {
		this.exitSession();
	}

	@HostListener('window:resize')
	sizeChange() {
		if (this.openviduLayout) {
			this.updateOpenViduLayout();
			this.checkSizeComponent();
		}
	}

	async ngOnInit() {
		this.lightTheme = this.theme === 'light';
		this.ovSettings = this.ovSettings ? this.ovSettings : await this.networkSrv.getOvSettingsData();
	}

	ngOnDestroy() {
		this.exitSession();
	}
	onConfigRoomJoin() {
		this.showConfigRoomCard = false;
		this.oVUsersSubscription = this.oVSessionService.OVUsers.subscribe(users => {
			this.localUsers = users;
		});
		this.mySessionId = this.oVSessionService.getSessionId();

		setTimeout(() => {
			this.openviduLayout = new OpenViduLayout();
			this.openviduLayoutOptions = this.utilsSrv.getOpenviduLayoutOptions();
			this.openviduLayout.initLayoutContainer(document.getElementById('layout'), this.openviduLayoutOptions);
			this.checkSizeComponent();
			this.joinToSession();
		}, 50);
	}

	joinToSession() {
		this.oVSessionService.initSessions();
		this.session = this.oVSessionService.getWebcamSession();
		this.sessionScreen = this.oVSessionService.getScreenSession();
		this.subscribeToStreamCreated();
		this.subscribeToStreamDestroyed();
		this.subscribeToStreamPropertyChange();
		this.subscribeToNicknameChanged();
		this.subscribeToChat();
		this.subscribeToReconnection();
		this.connectToSession();
	}

	exitSession() {
		this.oVSessionService.disconnect();
		if (this.oVUsersSubscription) {
			this.oVUsersSubscription.unsubscribe();
		}
		this.session = null;
		this.sessionScreen = null;
		this.localUsers = [];
		this.remoteUsers = [];
		this.openviduLayout = null;
		this.router.navigate(['']);
		this.leaveSession.emit();
	}

	onNicknameUpdate(nickname: string) {
		this.oVSessionService.setWebcamName(nickname);
		this.sendNicknameSignal(nickname);
	}

	toggleChat() {
		this.chat.toggle().then(() => {
			this.chatOpened = this.chat.opened;
			if (this.chatOpened) {
				this.newMessages = 0;
			}
			const timeout = this.isWebComponent ? 300 : 0;
			this.updateOpenViduLayout(timeout);
		});
	}

	toggleMic(): void {
		if (this.oVSessionService.isWebCamEnabled()) {
			this.oVSessionService.publishWebcamAudio(!this.oVSessionService.hasWebcamAudioActive());
			return;
		}
		this.oVSessionService.publishScreenAudio(!this.oVSessionService.hasScreenAudioActive());
	}

	// ? ChatService
	checkNotification() {
		this.newMessages = this.chatOpened ? 0 : this.newMessages + 1;
	}

	async toggleCam() {
		const isVideoActive = !this.oVSessionService.hasWebcamVideoActive();

		// Disabling webcam
		if (this.oVSessionService.areBothConnected()) {
			this.oVSessionService.publishVideo(isVideoActive);
			this.oVSessionService.disableWebcamUser();
			this.oVSessionService.unpublishWebcam();
			this.updateOpenViduLayout();
			return;
		}
		// Enabling webcam
		if (this.oVSessionService.isOnlyScreenConnected()) {
			const hasAudio = this.oVSessionService.hasScreenAudioActive();

			await this.oVSessionService.publishWebcam();
			this.oVSessionService.publishScreenAudio(false);
			this.oVSessionService.publishWebcamAudio(hasAudio);
			this.oVSessionService.enableWebcamUser();
		}
		// Muting/unmuting webcam
		this.oVSessionService.publishVideo(isVideoActive);
		this.updateOpenViduLayout();
	}

	async toggleScreenShare() {
		// Disabling screenShare
		if (this.oVSessionService.areBothConnected()) {
			this.removeScreen();
			return;
		}

		// Enabling screenShare
		if (this.oVSessionService.isOnlyWebcamConnected()) {
			const screenPublisher = this.initScreenPublisher();

			screenPublisher.once('accessAllowed', event => {
				this.log.d('ACCESS ALOWED screenPublisher');
				this.oVSessionService.enableScreenUser(screenPublisher);
				this.oVSessionService.publishScreen();
				if (!this.oVSessionService.hasWebcamVideoActive()) {
					// Disabling webcam
					this.oVSessionService.disableWebcamUser();
					this.oVSessionService.unpublishWebcam();
				}
			});

			screenPublisher.once('accessDenied', event => {
				this.log.w('ScreenShare: Access Denied');
			});
			return;
		}

		// Disabling screnShare and enabling webcam
		const hasAudio = this.oVSessionService.hasScreenAudioActive();
		await this.oVSessionService.publishWebcam();
		this.oVSessionService.publishScreenAudio(false);
		this.oVSessionService.publishWebcamAudio(hasAudio);
		this.oVSessionService.enableWebcamUser();
		this.removeScreen();
	}

	toggleSpeakerLayout() {
		this.log.d('Automatic Layout ' + this.isAutoLayout ? 'Disabled' : 'Enabled' );
		if (this.isAutoLayout) {
			this.session.off('publisherStartSpeaking');
			this.isAutoLayout = !this.isAutoLayout;
			return;
		}
		this.subscribeToSpeachDetection();
		this.isAutoLayout = !this.isAutoLayout;
	}

	toggleDialogExtension() {
		this.showDialogExtension = !this.showDialogExtension;
	}

	onReplaceScreenTrack(event) {
		this.oVSessionService.replaceScreenTrack();
	}

	checkSizeComponent() {
		this.compact = document.getElementById('room-container').offsetWidth <= 790;
		this.sidenavMode = this.compact ? 'over' : 'side';
	}

	onToggleVideoSize(event: {element: HTMLElement, connectionId?: string, resetAll?: boolean}) {
		const element = event.element;
		if (!!event.resetAll) {
			this.resetAllBigElements();
		}

		this.utilsSrv.toggleBigElementClass(element);

		// Has been mandatory change the user fullscreen property here because of
		// fullscreen icons and cannot handle publisherStartSpeaking event in other component
		if (!!event?.connectionId) {
			if (this.oVSessionService.isMyOwnConnection(event.connectionId)) {
				this.oVSessionService.toggleFullscreen(event.connectionId);
			} else {
				const user = this.getRemoteUserByConnectionId(event.connectionId);
				user.setVideoSizeBig(!user.isVideoSizeBig());
			}
		}
		this.updateOpenViduLayout();
	}

	toolbarMicIconEnabled(): boolean {
		if (this.oVSessionService.isWebCamEnabled()) {
			return this.oVSessionService.hasWebcamAudioActive();
		}
		return this.oVSessionService.hasScreenAudioActive();
	}

	private async connectToSession(): Promise<void> {
		if (this.tokens) {
			// ! Retrieves tokens from subcomponent or library
			// this.localUsers.forEach((user, index) => {
			// 	if (user.isLocal()) {
			// 		this.connect(this.tokens[index]);
			// 	} else if (user.isScreen()) {
			// 		this.startScreenSharing(index);
			// 	}
			// });
		} else {
			// Normal behaviour - OpenVidu Call
			const webcamToken = await this.getToken();
			const screenToken = await this.getToken();
			await this.connectBothSessions(webcamToken, screenToken);

			if (this.oVSessionService.areBothConnected()) {
				this.oVSessionService.publishWebcam();
				this.oVSessionService.publishScreen();
			} else if (this.oVSessionService.isOnlyScreenConnected()) {
				this.oVSessionService.publishScreen();
			} else {
				this.oVSessionService.publishWebcam();
			}
		}
		this.updateOpenViduLayout();
	}

	private async connectBothSessions(webcamToken: string, screenToken: string) {
		try {
			await this.oVSessionService.connectWebcamSession(webcamToken);
			await this.oVSessionService.connectScreenSession(screenToken);
			// ! Webcomponent
			// this.joinSession.emit();

			this.localUsers[0].getStreamManager().on('streamPlaying', () => {
				this.updateOpenViduLayout();
				(<HTMLElement>this.localUsers[0].getStreamManager().videos[0].video).parentElement.classList.remove('custom-class');
			});
		} catch (error) {
			this.error.emit({ error: error.error, messgae: error.message, code: error.code, status: error.status });
			this.log.d('There was an error connecting to the session:', error.code, error.message);
			this.utilsSrv.showErrorMessage('There was an error connecting to the session:', error.message);
		}
	}

	private subscribeToStreamCreated() {
		this.session.on('streamCreated', (event: StreamEvent) => {
			const connectionId = event.stream.connection.connectionId;

			if (this.oVSessionService.isMyOwnConnection(connectionId)) {
				this.updateOpenViduLayout(500);
				return;
			}

			const subscriber: Subscriber = this.session.subscribe(event.stream, undefined);

			// subscriber.on('streamPlaying', (e: StreamManagerEvent) => {
			// 	this.checkSomeoneShareScreen();
			// });

			const nickname = JSON.parse(event.stream.connection.data)?.clientData;
			const newUser = new UserModel(connectionId, subscriber, nickname);

			this.remoteUsers.push(newUser);
			this.updateOpenViduLayout();
		});
	}

	private subscribeToStreamDestroyed() {
		this.session.on('streamDestroyed', (event: StreamEvent) => {
			const connectionId = event.stream.connection.connectionId;
			const user = this.getRemoteUserByConnectionId(connectionId);
			const index = this.remoteUsers.indexOf(user, 0);
			if (index > -1) {
				this.remoteUsers.splice(index, 1);
			}
			// event.preventDefault();
			this.updateOpenViduLayout();
		});
	}

	private subscribeToStreamPropertyChange() {
		this.session.on('streamPropertyChanged', (event: StreamPropertyChangedEvent) => {
			// const connectionId = event.stream.connection.connectionId;
			// if (this.oVSessionService.isMyOwnConnection(connectionId)) {
			// 	return;
			// }
			// const user = this.getRemoteUserByConnectionId(connectionId);
			// if (event.changedProperty === 'videoActive') {
			// 	user.setVideoActive(<boolean>event.newValue);
			// }
			// if (event.changedProperty === 'audioActive') {
			// 	this.remoteUsers.some(user => user.isVideoActive());
			// 	user.setAudioActive(<boolean>event.newValue);
			// }
		});
	}

	private subscribeToNicknameChanged() {
		this.session.on('signal:nicknameChanged', (event: any) => {
			const connectionId = event.from.connectionId;
			if (this.oVSessionService.isMyOwnConnection(connectionId)) {
				return;
			}

			const user = this.getRemoteUserByConnectionId(connectionId);
			const nickname = JSON.parse(event.data).nickname;
			user.setNickname(nickname);
		});
	}


	private subscribeToSpeachDetection() {
		// Has been mandatory change the user fullscreen property here because of
		// fullscreen icons and cannot handle publisherStartSpeaking event in other component
		this.session.on('publisherStartSpeaking', (event: PublisherSpeakingEvent) => {
			const someoneIsSharingScreen = this.remoteUsers.some(user => user.isScreen());
			if (!this.oVSessionService.isScreenShareEnabled() && !someoneIsSharingScreen) {
				const elem = event.connection.stream.streamManager.videos[0].video;
				const element = this.utilsSrv.getHTMLElementByClassName(elem, LayoutType.ROOT_CLASS);
				this.resetAllBigElements();
				this.getRemoteUserByConnectionId(event.connection.connectionId)?.setVideoSizeBig(true);
				this.onToggleVideoSize({element});
			}
		});

		// this.session.on('publisherStopSpeaking', (event: PublisherSpeakingEvent) => {
		// });
	}

	private removeScreen() {
		this.oVSessionService.disableScreenUser();
		this.oVSessionService.unpublishScreen();
	}

	private subscribeToUserChanged() {
		this.session.on('signal:userChanged', (event: any) => {
			const data = JSON.parse(event.data);
			this.remoteUsers.forEach((user: UserModel) => {
				if (user.getConnectionId() === event.from.connectionId) {
					// if (!!data.isAudioActive) {
					// 	user.setAudioActive(data.isAudioActive);
					// }
					// if (!!data.isVideoActive) {
					// 	user.setVideoActive(data.isVideoActive);
					// }
					// if (!!data.nickname) {
					// 	user.setNickname(data.nickname);
					// }
					// if (!!data.isScreenShareActive) {
					// 	user.setScreenShareActive(data.isScreenShareActive);
					// }
					if (!!data.avatar) {
						user.setUserAvatar(data.avatar);
					}
				}
			});
		});
	}

	// ! Create chat service
	private subscribeToChat() {
		this.session.on('signal:chat', (event: any) => {
			const connectionId = event.from.connectionId;
			const data = JSON.parse(event.data);
			let owner: UserModel;
			if (this.oVSessionService.isMyOwnConnection(connectionId)) {
				owner = this.localUsers.filter(u => u.getConnectionId() === connectionId)[0];
			} else {
				owner = this.getRemoteUserByConnectionId(connectionId);
			}
			this.messageList.push({
				connectionId: data.connectionId,
				nickname: data.nickname,
				message: data.message,
				userAvatar: owner?.getAvatar() || this.utilsSrv.getOpeViduAvatar()
			});
			this.checkNotification();
			this.chatComponent.scrollToBottom();
		});
	}

	private subscribeToReconnection() {
		this.session.on('reconnecting', () => {
			this.log.w('Connection lost: Reconnecting');
			this.isConnectionLost = true;
			this.utilsSrv.showErrorMessage('Connection Problem', 'Oops! Trying to reconnect to the session ...', true);
		});
		this.session.on('reconnected', () => {
			this.log.w('Connection lost: Reconnected');
			this.isConnectionLost = false;
			this.utilsSrv.closeDialog();
		});
		this.session.on('sessionDisconnected', (event: SessionDisconnectedEvent) => {
			if (event.reason === 'networkDisconnect') {
				this.utilsSrv.closeDialog();
				this.exitSession();
			}
		});
	}

	private initScreenPublisher(): Publisher {
		const videoSource = ScreenType.SCREEN;
		const willThereBeWebcam = this.oVSessionService.isWebCamEnabled() && this.oVSessionService.hasWebcamVideoActive();
		const hasAudio = willThereBeWebcam ? false : this.oVSessionService.hasWebcamAudioActive();
		const properties = this.oVSessionService.createProperties(videoSource, undefined, true, hasAudio, false);

		try {
			return this.oVSessionService.initScreenPublisher(undefined, properties);
		} catch (error) {
			this.log.e(error);
			if (error && error.name === 'SCREEN_EXTENSION_NOT_INSTALLED') {
				this.toggleDialogExtension();
			} else {
				this.utilsSrv.handlerScreenShareError(error);
			}
		}
	}

	private async getToken(): Promise<string> {
		try {
			return await this.networkSrv.getToken(this.mySessionId, this.openviduServerUrl, this.openviduSecret);
		} catch (error) {
			this.error.emit({ error: error.error, messgae: error.message, code: error.code, status: error.status });
			this.log.e('There was an error getting the token:', error.code, error.message);
			this.utilsSrv.showErrorMessage('There was an error getting the token:', error.message);
		}
	}

	private getRemoteUserByConnectionId(connectionId): UserModel {
		return this.remoteUsers.filter(u => u.getConnectionId() === connectionId)[0];
	}

	private sendNicknameSignal(nickname) {
		const signalOptions: SignalOptions = {
			data: JSON.stringify({ nickname }),
			type: 'nicknameChanged'
		};
		this.session.signal(signalOptions);
	}

	private updateOpenViduLayout(timeout?: number) {
		if (!!this.openviduLayout) {
			if (!timeout) {
				this.openviduLayout.updateLayout();
				return;
			}
			setTimeout(() => {
				this.openviduLayout.updateLayout();
			}, timeout);
		}
	}

	private resetAllBigElements() {
		this.utilsSrv.removeAllBigElementClass();
		this.remoteUsers.forEach(u => u.setVideoSizeBig(false));
		this.oVSessionService.resetUsersFullscreen();
	}
}
