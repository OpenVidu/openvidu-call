import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OpenVidu, Publisher, Session, SignalOptions, Stream, StreamEvent, StreamManagerEvent, StreamManager } from 'openvidu-browser';
import { DialogErrorComponent } from '../shared/components/dialog-error/dialog-error.component';
import { OpenViduLayout, OpenViduLayoutOptions } from '../shared/layout/openvidu-layout';
import { UserModel } from '../shared/models/user-model';
import { NetworkService } from '../shared/services/network/network.service';
import { ChatComponent } from '../shared/components/chat/chat.component';
import { OvSettings } from '../shared/models/ov-settings';
import { UtilsService } from '../shared/services/utils/utils.service';
import { OpenViduSessionService } from '../shared/services/openvidu-session/openvidu-session.service';
import { DevicesService } from '../shared/services/devices/devices.service';
import { Subscription } from 'rxjs';

enum SCREEN_TYPE {
	WINDOW = 'window',
	SCREEN = 'screen'
}

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

	// Constants
	readonly BIG_ELEMENT_CLASS = 'OV_big';
	readonly SCREEN_TYPE: 'screen' = 'screen';
	readonly REMOTE_TYPE: 'remote' = 'remote';

	// Variables
	compact = false;
	sidenavMode: 'side' | 'over' = 'side';
	lightTheme: boolean;
	chatOpened: boolean;
	showDialogExtension = false;
	showDialogChooseRoom = true;
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

	private OV: OpenVidu;
	private OVScreen: OpenVidu;
	private userCamDeleted: UserModel;

	private oVUsersSubscription: Subscription;

	constructor(
		private networkSrv: NetworkService,
		private router: Router,
		public dialog: MatDialog,
		private utilsSrv: UtilsService,
		private oVSessionService: OpenViduSessionService,
		private oVDevicesService: DevicesService
	) {}

	@HostListener('window:beforeunload')
	beforeunloadHandler() {
		this.exitSession();
	}

	@HostListener('window:resize')
	sizeChange() {
		if (this.openviduLayout) {
			this.openviduLayout.updateLayout();
			this.checkSizeComponent();
		}
	}

	ngOnInit() {
		this.checkTheme();
		this.networkSrv
			.getOvSettingsData()
			.then((data: OvSettings) => {
				this.ovSettings = this.ovSettings ? this.ovSettings : data;
			})
			.catch(error => console.error(error));
	}

	ngOnDestroy() {
		this.exitSession();
	}

	toggleChat() {
		this.chat.toggle().then(() => {
			this.chatOpened = this.chat.opened;
			if (this.chatOpened) {
				this.newMessages = 0;
			}
			const ms = this.isWebComponent ? 300 : 0;
			setTimeout(() => this.openviduLayout.updateLayout(), ms);
		});
	}

	checkNotification() {
		this.newMessages = this.chatOpened ? 0 : this.newMessages + 1;
	}

	joinToSession() {
		this.OV = new OpenVidu();
		this.OVScreen = new OpenVidu();
		// this.session = this.OV.initSession();
		// this.sessionScreen = this.OVScreen.initSession();
		this.oVSessionService.initSession();
		this.session = this.oVSessionService.getWebcamSession();
		this.sessionScreen = this.oVSessionService.getScreenSession();
		// !! Refactor these methods
		// this.subscribeToUserChanged();
		// this.subscribeToStreamCreated();
		// this.subscribedToStreamDestroyed();
		// this.subscribedToChat();
		this.connectToSession();
	}

	exitSession() {
		if (this.sessionScreen) {
			this.sessionScreen.disconnect();
		}
		if (this.session) {
			this.session.disconnect();
		}
		// this.OV = null;
		// this.OVScreen = null;
		// this.oVSessionService.reset();
		// this.oVUsersSubscription.unsubscribe();
		this.session = null;
		this.sessionScreen = null;
		this.userCamDeleted = null;
		this.localUsers = [];
		this.remoteUsers = [];
		this.openviduLayout = null;
		this.router.navigate(['']);
		this.leaveSession.emit();
	}

	nicknameChanged(nickname: string): void {
		this.localUsers.forEach(user => {
			user.setNickname(nickname);
			this.sendSignalUserChanged(user);
		});
	}

	toggleMic(): void {
		this.localUsers[0].setAudioActive(!this.localUsers[0].isAudioActive());
		(<Publisher>this.localUsers[0].getStreamManager()).publishAudio(this.localUsers[0].isAudioActive());
		this.sendSignalUserChanged(this.localUsers[0]);
	}

	async toggleCam() {
		const isVideoActive = !this.oVSessionService.hasWebCamVideoActive();

		if (this.oVSessionService.areBothConnected()) {
			this.oVSessionService.publishVideo(isVideoActive);

			this.oVSessionService.disableWebcamUser();
			this.oVSessionService.unpublishWebcam();
		} else if (this.oVSessionService.isOnlyScreenConnected()) {
			this.oVSessionService.enableWebcamUser();
			await this.oVSessionService.publishWebcam();
			this.oVSessionService.publishVideo(isVideoActive);
		}
	}

	replaceScreenTrack() {
		console.log('replaceScreenTrack');
		this.oVSessionService.replaceScreenTrack();
	}

	toggleScreenShare() {
		if (this.oVSessionService.isScreenShareEnabled()) {
			if (this.oVSessionService.isOnlyScreenConnected()) {
				this.oVSessionService.enableWebcamUser();
				this.oVSessionService.publishWebcam();
			}
			this.oVSessionService.disableScreenUser();
			this.oVSessionService.unpublishScreenSession();
		} else {
			this.initScreenPublisher();
		}
	}

	publishCamSession() {
		const hasAudio = this.localUsers[0].isAudioActive();
		this.setFirstUserAudio(false);
		this.localUsers.unshift(this.userCamDeleted);
		this.localUsers[0].setVideoActive(true);
		this.localUsers[0].setAudioActive(hasAudio);
		this.publishSession(this.localUsers[0])
			.then(() => {
				(<Publisher>this.localUsers[0].getStreamManager()).publishVideo(true);
				(<Publisher>this.localUsers[0].getStreamManager()).publishAudio(hasAudio);
				this.sendSignalUserChanged(this.localUsers[0]);
			})
			.catch(error => console.error(error));
	}

	toggleDialogExtension() {
		this.showDialogExtension = !this.showDialogExtension;
	}

	onConfigRoomJoin() {
		this.showDialogChooseRoom = false;
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

	screenShareAndChangeScreen() {
		const videoSource = this.getScreenVideoSource();
		const hasAudio = this.localUsers[0].isLocal() ? false : true;
		const publisherProperties = {
			videoSource: videoSource,
			publishAudio: hasAudio,
			publishVideo: true,
			mirror: false
		};
		this.OVScreen.initPublisherAsync(undefined, publisherProperties)
			.then((publisher: Publisher) => {
				publisher.once('accessAllowed', () => {
					// CHANGE CAMERA
					if ((this.localUsers[0].isLocal() && this.localUsers[1]) || this.localUsers[0].isScreen()) {
						const index = this.localUsers[0].isLocal() ? 1 : 0;
						this.sessionScreen.unpublish(<Publisher>this.localUsers[index].getStreamManager());
						this.localUsers[index].setStreamManager(publisher);
						this.sessionScreen.publish(publisher);
					} else {
						// ADD NEW SCREEN USER
						console.log('STREAM SHARE - ELSE: position 1');
						this.localUsers.push(this.createScreenUser(publisher));
						// this.startScreenSharing(1);
					}
				});
			})
			.catch(error => {
				if (error && error.name === 'SCREEN_EXTENSION_NOT_INSTALLED') {
					this.toggleDialogExtension();
				} else {
					this.utilsSrv.handlerScreenShareError(error);
				}
			});
	}

	checkSizeComponent() {
		this.compact = document.getElementById('room-container').offsetWidth <= 790;
		this.sidenavMode = this.compact ? 'over' : 'side';
	}

	enlargeElement(event) {
		const path = event.path ? event.path : event.composedPath(); // Chrome or Firefox
		const element: HTMLElement = path.filter((e: HTMLElement) => e.className && e.className.includes('OT_root'))[0];
		if (element.className.includes(this.BIG_ELEMENT_CLASS)) {
			element.classList.remove(this.BIG_ELEMENT_CLASS);
		} else {
			element.classList.add(this.BIG_ELEMENT_CLASS);
		}
		this.openviduLayout.updateLayout();
	}

	connectionBelongToMyUsers(connectionId: string): boolean {
		return (
			(this.localUsers[0] &&
				this.localUsers[0].getConnectionId() === connectionId &&
				this.localUsers[1] &&
				this.localUsers[1].getConnectionId() === connectionId) ||
			(this.localUsers[0] && !this.localUsers[1] && this.localUsers[0].getConnectionId() === connectionId)
		);
	}

	private deleteRemoteStream(stream: Stream): void {
		const userStream = this.remoteUsers.filter((user: UserModel) => user.getStreamManager().stream === stream)[0];
		const index = this.remoteUsers.indexOf(userStream, 0);
		if (index > -1) {
			this.remoteUsers.splice(index, 1);
		}
	}

	private subscribeToStreamCreated() {
		this.session.on('streamCreated', (event: StreamEvent) => {
			const connectionId = event.stream.connection.connectionId;
			if (!this.connectionBelongToMyUsers(connectionId)) {
				const subscriber = this.session.subscribe(event.stream, undefined);
				subscriber.on('streamPlaying', (e: StreamManagerEvent) => {
					this.checkSomeoneShareScreen();
					(<HTMLElement>subscriber.videos[0].video).parentElement.classList.remove('custom-class');
				});
				const newUser = new UserModel();
				newUser.setStreamManager(subscriber);
				newUser.setConnectionId(event.stream.connection.connectionId);
				const nickname = event.stream.connection.data.split('%')[0];
				newUser.setNickname(JSON.parse(nickname).clientData);
				const type = event.stream.typeOfVideo === 'SCREEN' ? this.SCREEN_TYPE : this.REMOTE_TYPE;
				newUser.setType(type);
				this.remoteUsers.push(newUser);

				this.localUsers.forEach(user => {
					this.sendSignalUserChanged(user);
				});
			}
		});
	}

	private async connectToSession(): Promise<void> {
		if (this.tokens) {
			// Retrieves tokens from subcomponent or library
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
	}

	private async connectBothSessions(webcamToken: string, screenToken: string) {
		try {
			await this.oVSessionService.connectWebcamSession(webcamToken);
			await this.oVSessionService.connectScreenSession(screenToken);

			// this.sendSignalUserChanged(this.localUsers[0]);
			// ! this.joinSession.emit(); Webcomponent

			this.localUsers[0].getStreamManager().on('streamPlaying', () => {
				this.openviduLayout.updateLayout();
				(<HTMLElement>this.localUsers[0].getStreamManager().videos[0].video).parentElement.classList.remove('custom-class');
			});
		} catch (error) {
			this.error.emit({ error: error.error, messgae: error.message, code: error.code, status: error.status });
			console.log('There was an error connecting to the session:', error.code, error.message);
			this.openDialogError('There was an error connecting to the session:', error.message);
		}
	}

	private subscribeToUserChanged() {
		this.session.on('signal:userChanged', (event: any) => {
			const data = JSON.parse(event.data);
			this.remoteUsers.forEach((user: UserModel) => {
				if (user.getConnectionId() === event.from.connectionId) {
					if (!!data.isAudioActive) {
						user.setAudioActive(data.isAudioActive);
					}
					if (!!data.isVideoActive) {
						user.setVideoActive(data.isVideoActive);
					}
					if (!!data.nickname) {
						user.setNickname(data.nickname);
					}
					if (!!data.isScreenShareActive) {
						user.setScreenShareActive(data.isScreenShareActive);
					}
					if (!!data.avatar) {
						user.setUserAvatar(data.avatar);
					}
				}
			});
			this.checkSomeoneShareScreen();
		});
	}

	private subscribedToStreamDestroyed() {
		this.session.on('streamDestroyed', (event: StreamEvent) => {
			this.deleteRemoteStream(event.stream);
			this.checkSomeoneShareScreen();
			event.preventDefault();
		});
	}

	private subscribedToChat() {
		this.session.on('signal:chat', (event: any) => {
			const data = JSON.parse(event.data);
			const messageOwner =
				this.localUsers[0].getConnectionId() === data.connectionId
					? this.localUsers[0]
					: this.remoteUsers.filter(user => user.getConnectionId() === data.connectionId)[0];
			this.messageList.push({
				connectionId: data.connectionId,
				nickname: data.nickname,
				message: data.message,
				userAvatar: messageOwner.getAvatar()
			});
			this.checkNotification();
			this.chatComponent.scrollToBottom();
		});
	}

	private sendSignalUserChanged(user: UserModel): void {
		const session = user.isLocal() ? this.session : this.sessionScreen;
		const data = {
			isAudioActive: user.isAudioActive(),
			isVideoActive: user.isVideoActive(),
			isScreenShareActive: user.isScreenShareActive(),
			nickname: user.getNickname(),
			avatar: user.getAvatar()
		};
		const signalOptions: SignalOptions = {
			data: JSON.stringify(data),
			type: 'userChanged'
		};
		session.signal(signalOptions);
	}

	private openDialogError(message, messageError: string) {
		this.dialog.open(DialogErrorComponent, {
			width: '450px',
			data: { message: message, messageError: messageError }
		});
	}

	private checkSomeoneShareScreen() {
		let isScreenShared: boolean;
		// return true if at least one passes the test
		isScreenShared = this.remoteUsers.some(user => user.isScreenShareActive()) || this.localUsers[0].isScreenShareActive();
		this.openviduLayoutOptions.fixedRatio = isScreenShared;
		this.openviduLayout.setLayoutOptions(this.openviduLayoutOptions);
		this.openviduLayout.updateLayout();
	}

	private checkTheme() {
		this.lightTheme = this.theme === 'light';
	}

	private removeAndSaveFirstUser() {
		setTimeout(() => {
			this.localUsers[0].setVideoActive(false);
			this.userCamDeleted = this.localUsers.shift();
			this.setFirstUserAudio(this.userCamDeleted.isAudioActive());
			this.openviduLayout.updateLayout();
		}, 200);
	}

	private setFirstUserAudio(value: boolean) {
		this.localUsers[0].setAudioActive(value);
		(<Publisher>this.localUsers[0].getStreamManager()).publishAudio(value);
	}

	private createScreenUser(publisher: StreamManager): UserModel {
		const user = new UserModel();
		user.setScreenShareActive(true);
		user.setType(this.SCREEN_TYPE);
		user.setStreamManager(publisher);
		user.setNickname(this.localUsers[0].getNickname());
		user.setUserAvatar(this.localUsers[0].getAvatar());
		user.setAudioActive(false);
		return user;
	}

	private initScreenPublisher() {
		const videoSource = this.getScreenVideoSource();
		const willThereBeWebcam = this.oVSessionService.isWebCamEnabled() && this.oVSessionService.hasWebCamVideoActive();
		const hasAudio = willThereBeWebcam ? false : this.oVSessionService.hasWebcamAudioActive();
		const properties = this.oVSessionService.createProperties(videoSource, undefined, true, hasAudio, false);

		try {
			const screenPublisher = this.oVSessionService.initScreenPublisher(undefined, properties);
			screenPublisher.on('accessAllowed', event => {
				console.log('ACCESS ALOWED screenPublisher');
				this.oVSessionService.enableScreenUser(screenPublisher);
				this.oVSessionService.publishScreen();
			});

			screenPublisher.on('accessDenied', event => {
				console.warn('ScreenShare: Access Denied');
			});
		} catch (error) {
			console.error(error);
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
			console.log('There was an error getting the token:', error.code, error.message);
			this.openDialogError('There was an error getting the token:', error.message);
		}
	}

	private publishSession(user: UserModel): Promise<any> {
		return new Promise((resolve, reject) => {
			const session = user.isLocal() ? this.session : this.sessionScreen;
			session
				.publish(<Publisher>user.getStreamManager())
				.then(() => {
					resolve();
				})
				.catch(error => reject(error));
		});
	}

	getScreenVideoSource(): string {
		return this.utilsSrv.isFF() ? SCREEN_TYPE.WINDOW : SCREEN_TYPE.SCREEN;
	}
}
