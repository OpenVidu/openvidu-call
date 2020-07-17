import { Injectable } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { OpenVidu, PublisherProperties, Publisher, Session, Connection, SignalOptions } from 'openvidu-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { ScreenType } from '../../types/video-type';
import { AvatarType } from '../../types/chat-type';
import { LoggerService } from '../logger/logger.service';
import { ILogger } from '../../types/logger-type';

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

	private videoSource = undefined;
	private audioSource = undefined;
	private sessionId = '';
	private log: ILogger;

	private screenMediaStream: MediaStream = null;
	private webcamMediaStream: MediaStream = null;

	constructor(private loggerSrv: LoggerService) {
		this.log = this.loggerSrv.get('OpenViduSessionService');
	}

	initialize() {
		this.OV = new OpenVidu();
		this.OVScreen = new OpenVidu();

		this.OVUsers = this._OVUsers.asObservable();
		this.webcamUser = new UserModel();
		// Used when the streamManager is null (users without devices)
		this.webcamUser.setLocal(true);
		this._OVUsers.next([this.webcamUser]);
	}

	initSessions() {
		this.webcamSession = this.OV.initSession();
		this.screenSession = this.OVScreen.initSession();
	}

	getWebcamSession(): Session {
		return this.webcamSession;
	}

	getConnectedUserSession(): Session {
		return this.isWebCamEnabled() ? this.getWebcamSession() : this.getScreenSession();
	}

	getScreenSession(): Session {
		return this.screenSession;
	}

	async connectWebcamSession(token: string): Promise<any> {
		if (!!token) {
			await this.webcamSession.connect(token, { clientData: this.getWebcamUserName(), avatar: this.getWebCamAvatar() });
		}
	}

	async connectScreenSession(token: string): Promise<any> {
		if (!!token) {
			await this.screenSession.connect(token, { clientData: this.getScreenUserName(), avatar: this.getWebCamAvatar() });
		}
	}

	async publishWebcam(): Promise<any> {
		if (this.webcamSession.capabilities.publish) {
			const publisher = <Publisher>this.webcamUser.getStreamManager();
			if (!!publisher) {
				return await this.webcamSession.publish(publisher);
			}
		}
		this.log.w('User cannot publish');
	}

	async publishScreen(): Promise<any> {
		if (this.screenSession.capabilities.publish) {
			const publisher = <Publisher>this.screenUser.getStreamManager();
			if (!!publisher) {
				return await this.screenSession.publish(publisher);
			}
		}
		this.log.w('User cannot publish');
	}

	unpublishWebcam() {
		const publisher = <Publisher>this.webcamUser.getStreamManager();
		if (!!publisher) {
			this.publishScreenAudio(this.hasWebcamAudioActive());
			this.webcamSession.unpublish(publisher);
		}
	}

	unpublishScreen() {
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
	}

	enableScreenUser(screenPublisher: Publisher) {
		const connectionId = this.screenSession?.connection?.connectionId;

		this.screenUser = new UserModel(connectionId, screenPublisher, this.getScreenUserName());
		this.screenUser.setUserAvatar(this.webcamUser.getAvatar());

		if (this.isWebCamEnabled()) {
			this._OVUsers.next([this.webcamUser, this.screenUser]);
			return;
		}

		this.log.d('ENABLED SCREEN SHARE');
		this._OVUsers.next([this.screenUser]);
	}

	disableScreenUser() {
		this.destryoScreenUser();
		this._OVUsers.next([this.webcamUser]);
	}

	initCamPublisher(targetElement: string | HTMLElement, properties: PublisherProperties): Publisher {
		const publisher = this.initPublisher(targetElement, properties);
		this.webcamUser.setStreamManager(publisher);
		return publisher;
	}

	publishVideo(isVideoActive: boolean) {
		(<Publisher>this.webcamUser.getStreamManager()).publishVideo(isVideoActive);
		// Send event to subscribers because of viedeo has changed and view must update
		this._OVUsers.next(this._OVUsers.getValue());
	}

	publishWebcamAudio(audio: boolean) {
		const publisher = <Publisher>this.webcamUser?.getStreamManager();
		if (!!publisher) {
			publisher.publishAudio(audio);
		}
	}

	publishScreenAudio(audio: boolean) {
		const publisher = <Publisher>this.screenUser?.getStreamManager();
		if (!!publisher) {
			publisher.publishAudio(audio);
		}
	}

	replaceTrack(videoSource: string, audioSource: string, mirror: boolean = true): Promise<any> {
		return new Promise((resolve, reject) => {

			if (!!videoSource) {
				this.log.d('Replacing video track ' + videoSource);
				this.videoSource = videoSource;
				// this.stopVideoTracks(this.webcamUser.getStreamManager().stream.getMediaStream());
			}
			if (!!audioSource) {
				this.log.d('Replacing audio track ' + audioSource);
				this.audioSource = audioSource;
				// this.stopAudioTracks(this.webcamUser.getStreamManager().stream.getMediaStream());
			}
			this.destryoWebcamUser();
			const properties = this.createProperties(
				this.videoSource,
				this.audioSource,
				this.hasWebcamVideoActive(),
				this.hasWebcamAudioActive(),
				mirror
			);

			const publisher = this.initCamPublisher(undefined, properties);

			publisher.once('streamPlaying', () => {
				this.webcamUser.setStreamManager(publisher);
				resolve();
			});

			publisher.once('accessDenied', () => {
				reject();
			});


			// Reeplace track method
			// this.webcamMediaStream = await this.OV.getUserMedia(properties);
			// const track: MediaStreamTrack = !!videoSource
			// 	? this.webcamMediaStream.getVideoTracks()[0]
			// 	: this.webcamMediaStream.getAudioTracks()[0];

			// try {
			// 	await (<Publisher>this.webcamUser.getStreamManager()).replaceTrack(track);
			// } catch (error) {
			// 	this.log.e('Error replacing track ', error);
			// }
		});
	}

	async replaceScreenTrack() {
		const videoSource = ScreenType.SCREEN;
		const hasAudio = !this.isWebCamEnabled();
		const properties = this.createProperties(videoSource, undefined, true, hasAudio, false);

		this.stopScreenTracks();
		this.screenMediaStream = await this.OVScreen.getUserMedia(properties);
		await (<Publisher>this.screenUser.getStreamManager()).replaceTrack(this.screenMediaStream.getVideoTracks()[0]);
	}

	initScreenPublisher(targetElement: string | HTMLElement, properties: PublisherProperties): Publisher {
		this.log.d('init screen properties', properties);
		return this.initPublisher(targetElement, properties);
	}

	destroyUsers() {
		this.destryoScreenUser();
		this.destryoWebcamUser();
	}

	disconnect() {
		if (this.webcamSession) {
			this.log.d('Disconnecting screen session');
			this.webcamSession.disconnect();
			// this.stopWebcamTracks();
			this.webcamSession = null;
		}
		if (this.screenSession) {
			// Timeout neccessary to avoid race conditin error:
			// OpenVidu Error Remote connection unknown when 'onParticipantLeft'. Existing remote connections: []
			setTimeout(() => {
				this.log.d('Disconnecting screen session');
				this.screenSession.disconnect();
				this.stopScreenTracks();
				this.screenSession = null;
			}, 50);
		}
		this.destroyUsers();
		this.screenUser = null;
		this.videoSource = undefined;
		this.audioSource = undefined;
		this.sessionId = '';
		this.webcamUser = new UserModel();
		this._OVUsers.next([this.webcamUser]);
	}

	isWebCamEnabled(): boolean {
		return this._OVUsers.getValue()[0].isCamera();
	}

	isOnlyScreenConnected(): boolean {
		return this._OVUsers.getValue()[0].isScreen();
	}

	hasWebcamVideoActive(): boolean {
		return this.webcamUser.isVideoActive();
	}

	hasWebcamAudioActive(): boolean {
		return this.webcamUser?.isAudioActive();
	}

	hasScreenAudioActive(): boolean {
		return this.screenUser?.isAudioActive();
	}

	areBothConnected(): boolean {
		return this._OVUsers.getValue().length === 2;
	}

	isOnlyWebcamConnected(): boolean {
		return this.isWebCamEnabled() && !this.areBothConnected();
	}

	isScreenShareEnabled(): boolean {
		return this.areBothConnected() || this.isOnlyScreenConnected();
	}

	isMyOwnConnection(connectionId: string): boolean {
		return this.webcamSession?.connection?.connectionId === connectionId || this.screenSession?.connection?.connectionId === connectionId;
	}
	needSendNicknameSignal(): boolean {
		const oldNickname: string = JSON.parse(this.getWebcamSession().connection.data).clientData;
		return oldNickname !== this.getWebcamUserName();
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

	updateUsersNickname(nickname: string) {
		this.webcamUser.setNickname(nickname);
		this.screenUser?.setNickname(this.getScreenUserName());
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

	resetUsersZoom() {
		this.webcamUser?.setVideoSizeBig(false);
		this.screenUser?.setVideoSizeBig(false);
	}

	toggleZoom(connectionId: string) {
		if (this.webcamUser.getConnectionId() === connectionId) {
			this.webcamUser.setVideoSizeBig(!this.webcamUser.isVideoSizeBig());
			return;
		}
		this.screenUser.setVideoSizeBig(!this.screenUser.isVideoSizeBig());
	}

	sendNicknameSignal(connection?: Connection) {
		if (this.needSendNicknameSignal()) {
			const signalOptions: SignalOptions = {
				data: JSON.stringify({ nickname: this.getWebcamUserName() }),
				type: 'nicknameChanged',
				to: connection ? [connection] : undefined
			};
			this.getWebcamSession()?.signal(signalOptions);
			signalOptions.data = JSON.stringify({nickname: this.getScreenUserName()});
			this.getScreenSession()?.signal(signalOptions);
		}
	}

	private initPublisher(targetElement: string | HTMLElement, properties: PublisherProperties): Publisher {
		return this.OV.initPublisher(targetElement, properties);
	}

	private destryoScreenUser() {
		if (this.screenUser?.getStreamManager()) {
			// this.screenUser.getStreamManager().off('streamAudioVolumeChange');
			this.screenUser.getStreamManager().stream.disposeWebRtcPeer();
			this.screenUser.getStreamManager().stream.disposeMediaStream();
		}
	}

	private destryoWebcamUser() {
		if (this.webcamUser?.getStreamManager()) {
			// this.webcamUser.getStreamManager().off('streamAudioVolumeChange');
			this.webcamUser.getStreamManager().stream.disposeWebRtcPeer();
			this.webcamUser.getStreamManager().stream.disposeMediaStream();
		}
	}

	private stopScreenTracks() {
		if (this.screenMediaStream) {
			this.stopAudioTracks(this.screenMediaStream);
			this.stopVideoTracks(this.screenMediaStream);
		}
	}

	// private stopWebcamTracks() {
	// 	if (this.webcamMediaStream) {
	// 		this.stopAudioTracks(this.webcamMediaStream);
	// 		this.stopVideoTracks(this.webcamMediaStream);
	// 	}
	// }

	private stopAudioTracks(mediaStream: MediaStream) {
		mediaStream?.getAudioTracks().forEach((track) => {
			track.stop();

			track.enabled = false;
		});
		this.webcamMediaStream?.getAudioTracks().forEach((track) => {
			track.stop();
		});
	}

	private stopVideoTracks(mediaStream: MediaStream) {
		mediaStream?.getVideoTracks().forEach((track) => {
			track.stop();
		});
	}
}
