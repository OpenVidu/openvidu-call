import { Injectable } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { OpenVidu, PublisherProperties, Publisher, Session } from 'openvidu-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { VideoType } from '../../types/video-type';
import { AvatarType } from '../../types/chat-type';

@Injectable({
	providedIn: 'root'
})
export class OpenViduSessionService {

	OVUsers: Observable<UserModel[]>;
	private _OVUsers = <BehaviorSubject<UserModel[]>>new BehaviorSubject([]);

	private OV: OpenVidu = null;
	private OVScreen: OpenVidu = null;

	private webcamSession: Session = null;
	private screenSession: Session = null;

	private webcamUser: UserModel = null;
	private screenUser: UserModel = null;

	private videoSource = '';
	private audioSource = '';

	private sessionId = '';

	constructor() {
		this.OV = new OpenVidu();
		this.OVScreen = new OpenVidu();

		this.OVUsers = this._OVUsers.asObservable();
		this.webcamUser = new UserModel();
		this._OVUsers.next([this.webcamUser]);
	}

	initSession() {
		this.webcamSession = this.OV.initSession();
		this.screenSession = this.OVScreen.initSession();
	}

	getWebcamSession(): Session {
		return this.webcamSession;
	}

	getScreenSession(): Session {
		return this.screenSession;
	}

	async connectWebcamSession(token: string): Promise<any> {
		await this.webcamSession.connect(token, { clientData: this.getWebcamUserName() });
	}

	async connectScreenSession(token: string): Promise<any> {
		await this.screenSession.connect(token, { clientData: this.getScreenUserName() });
	}

	async publishWebcam(): Promise<any> {
		if (!this.webcamUser.getConnectionId()) {
			this.webcamUser.setConnectionId(this.webcamSession.connection.connectionId);
			// this.webcamUser.setLocalConnectionId(this.webcamSession.connection.connectionId);
		}

		if (this.webcamSession.capabilities.publish) {
			const publisher = <Publisher>this.webcamUser.getStreamManager();
			if (!!publisher) {
				return await this.webcamSession.publish(publisher);
			}
			return;
		}
		console.warn('User cannot publish');
	}

	async publishScreen(): Promise<any> {
		if (!this.screenUser.getConnectionId()) {
			this.screenUser.setConnectionId(this.screenSession.connection.connectionId);
		}
		if (this.screenSession.capabilities.publish) {
			const publisher = <Publisher>this.screenUser.getStreamManager();
			if (!!publisher) {
				return await this.screenSession.publish(publisher);
			}
			return;
		}
		console.warn('User cannot publish');
	}

	unpublishWebcam() {
		const publisher = <Publisher>this.webcamUser.getStreamManager();
		if (!!publisher) {
			this.webcamSession.unpublish(publisher);
		}
	}

	unpublishScreenSession() {
		const publisher = <Publisher>this.screenUser.getStreamManager();
		if (!!publisher) {
			this.screenSession.unpublish(publisher);
		}
	}

	enableWebcamUser() {
		this._OVUsers.next([this.webcamUser, this.screenUser]);
	}

	disableWebcamUser() {
		// this.destryowebcamUser();
		this._OVUsers.next([this.screenUser]);
		this.webcamUser.setScreenShareActive(true);
	}

	enableScreenUser(screenPublisher: Publisher) {
		const hasAudio = this.webcamUser.isVideoActive() ? false : this.webcamUser.isAudioActive();
		const hasVideo = true;
		const connectionId = this.screenSession?.connection?.connectionId;

		this.screenUser = new UserModel(connectionId, screenPublisher, hasAudio, hasVideo, this.getScreenUserName(), VideoType.SCREEN);

		// ! REFACTOR, check if it's necessary
		this.screenUser.setScreenShareActive(true);
		this.webcamUser.setScreenShareActive(false);
		this.screenUser.setUserAvatar(this.webcamUser.getAvatar());
		// !

		if (this.isWebCamEnabled()) {
			// this.disableWebcamUser();
			// this.unpublishWebcam();
			// Enabling webcam user audio
			// this.webcamUser.setAudioActive(true);
			// (<Publisher>this.webcamUser.getStreamManager()).publishAudio(true);
			this._OVUsers.next([this.webcamUser, this.screenUser]);
			return;
		}

		console.log('ENABLED SCREEN SHARE');
		this._OVUsers.next([this.screenUser]);
	}

	disableScreenUser() {
		this.destryoScreenUser();
		this.webcamUser.setScreenShareActive(false);
		this._OVUsers.next([this.webcamUser]);
	}

	initCamPublisher(targetElement: string | HTMLElement, properties: PublisherProperties): Publisher {
		const publisher = this.initPublisher(targetElement, properties);
		this.webcamUser.setStreamManager(publisher);
		return publisher;
	}

	publishVideo(isVideoActive: boolean) {
		this.webcamUser.setVideoActive(isVideoActive);
		(<Publisher>this.webcamUser.getStreamManager()).publishVideo(isVideoActive);
	}

	publishAudio(isAudioActive: boolean) {
		this.webcamUser.setAudioActive(isAudioActive);
		(<Publisher>this.webcamUser.getStreamManager()).publishAudio(isAudioActive);
	}

	replaceTrack(videoSource: string, audioSource: string) {
		if (!!videoSource) {
			this.videoSource = videoSource;
		}
		if (!!audioSource) {
			this.audioSource = audioSource;
		}

		const properties = this.createProperties(
			this.videoSource,
			this.audioSource,
			this.webcamUser.isVideoActive(),
			this.webcamUser.isAudioActive(),
			true
		);

		this.OV.getUserMedia(properties).then(mediaStream => {
			const track = mediaStream.getVideoTracks()[0];
			(<Publisher>this.webcamUser.getStreamManager()).replaceTrack(track);
		});

	}

	replaceScreenTrack() {
		const videoSource = navigator.userAgent.indexOf('Firefox') !== -1 ? 'window' : 'screen';
		const hasAudio = !this.isWebCamEnabled();
		const properties = this.createProperties(videoSource, undefined, true, hasAudio, false);

		const publisher = this.OVScreen.initPublisher(undefined, properties);

		publisher.once('accessAllowed', () => {
			this.screenSession.unpublish(<Publisher>this.screenUser.getStreamManager());
			this.screenUser.setStreamManager(publisher);
			this.screenSession.publish(publisher);
		});
	}

	initScreenPublisher(targetElement: string | HTMLElement, properties: PublisherProperties): Publisher {
		const publisher = this.initPublisher(targetElement, properties);
		return publisher;
	}

	destroyUsers() {
		this.destryoScreenUser();
		this.destryoWebcamUser();
		// Initial state
		this._OVUsers.next([this.webcamUser]);
	}

	disconnect() {
		if (this.screenSession) {
			this.screenSession.disconnect();
			this.screenSession = null;
		}
		if (this.webcamSession) {
			this.webcamSession.disconnect();
			this.webcamSession = null;
		}
		this.screenUser = null;
		this.videoSource = '';
		this.audioSource = '';
		this.sessionId = '';

		this.webcamUser = new UserModel();
		this._OVUsers.next([this.webcamUser]);
	}

	isWebCamEnabled(): boolean {
		return this._OVUsers.value[0].isLocal();
	}

	hasWebcamVideoActive(): boolean {
		return this.webcamUser.isVideoActive();
	}

	hasWebcamAudioActive(): boolean {
		return this.webcamUser.isAudioActive();
	}

	areBothConnected(): boolean {
		return this._OVUsers.value.length === 2;
	}

	isOnlyWebcamConnected(): boolean {
		return this.isWebCamEnabled() && !this.areBothConnected();
	}

	isOnlyScreenConnected(): boolean {
		return this._OVUsers.value[0].isScreen();
	}

	isScreenShareEnabled(): boolean {
		return this.areBothConnected() || this.isOnlyScreenConnected();
	}

	isMyOwnConnection(connectionId: string): boolean {
		return this.webcamUser?.getConnectionId() === connectionId || this.screenUser?.getConnectionId() === connectionId;
	}

	createProperties(
		videoSource: string | MediaStreamTrack | boolean,
		audioSource: string | MediaStreamTrack | boolean,
		publishVideo: boolean,
		publishAudio: boolean,
		mirror: boolean
	): PublisherProperties {
		return {
			videoSource,
			audioSource,
			publishVideo,
			publishAudio,
			mirror
		};
	}

	setSessionId(sessionId: string) {
		this.sessionId = sessionId;
	}

	getSessionId(): string {
		return this.sessionId;
	}

	setWebcamAvatar() {
		this.webcamUser.setUserAvatar();
	}

	setAvatar(option: AvatarType, avatar?: string): void {
		if ((option === AvatarType.RANDOM && avatar) || (AvatarType.VIDEO && avatar)) {
			if (option === AvatarType.RANDOM) {
				this.webcamUser.setUserAvatar(avatar);
			}
		}
	}

	setWebcamName(nickname: string) {
		this.webcamUser.setNickname(nickname);
	}

	getWebCamAvatar(): string {
		return this.webcamUser.getAvatar();
	}

	getWebcamUserName(): string {
		return this.webcamUser.getNickname();
	}

	getScreenUserName() {
		return this.getWebcamUserName() + '_SCREEN';
	}

	private initPublisher(targetElement: string | HTMLElement, properties: PublisherProperties): Publisher {
		return this.OV.initPublisher(targetElement, properties);
	}

	private destryoScreenUser() {
		if (this.screenUser?.getStreamManager()) {
			this.screenUser.getStreamManager().off('streamAudioVolumeChange');
			this.screenUser.getStreamManager().stream.disposeWebRtcPeer();
			this.screenUser.getStreamManager().stream.disposeMediaStream();
		}
	}

	private destryoWebcamUser() {
		if (this.webcamUser?.getStreamManager()) {
			this.webcamUser.getStreamManager().off('streamAudioVolumeChange');
			this.webcamUser.getStreamManager().stream.disposeWebRtcPeer();
			this.webcamUser.getStreamManager().stream.disposeMediaStream();
		}
	}
}
