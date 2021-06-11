import { Injectable } from '@angular/core';
import { IOpenViduWebRTC } from './openvidu-webrtc.interface';
import { PublisherProperties, Publisher, Connection, OpenVidu, Session, SignalOptions } from 'openvidu-browser';
import { Signal } from '../../types/singal-type';
import { LoggerService } from '../logger/logger.service';
import { ILogger } from '../../types/logger-type';
import { LocalUsersService } from '../local-users/local-users.service';
import { ScreenType } from '../../types/video-type';
import { environment } from '../../../../environments/environment';


@Injectable({
	providedIn: 'root'
})
export class OpenViduWebrtcService implements IOpenViduWebRTC {
	private OV: OpenVidu = null;
	private OVScreen: OpenVidu = null;

	private webcamSession: Session = null;
	private screenSession: Session = null;

	private videoSource = undefined;
	private audioSource = undefined;

	private screenMediaStream: MediaStream = null;
	private webcamMediaStream: MediaStream = null;

	private log: ILogger;

	constructor(private loggerSrv: LoggerService, private localUsersSrv: LocalUsersService) {
		this.log = this.loggerSrv.get('OpenViduWebRTCService');
	}

	initialize() {
		this.OV = new OpenVidu();
		this.OVScreen = new OpenVidu();
		if (environment.production) {
			this.OV.enableProdMode();
			this.OVScreen.enableProdMode();
		}
	}

	initSessions() {
		this.initializeWebcamSession();
		this.initializeScreenSession();
	}

	getWebcamSession(): Session {
		return this.webcamSession;
	}

	isWebcamSessionConnected(): boolean {
		return !!this.webcamSession.capabilities;
	}

	initializeWebcamSession(): void {
		this.webcamSession = this.OV.initSession();
	}

	initializeScreenSession(): void {
		this.screenSession = this.OVScreen.initSession();
	}

	getScreenSession(): Session {
		return this.screenSession;
	}

	isScreenSessionConnected(): boolean {
		return !!this.screenSession.capabilities;
	}

	async connectWebcamSession(token: string): Promise<any> {
		if (!!token) {
			this.log.d('Connecting webcam session');
			const webcamUsername = this.localUsersSrv.getWebcamUserName();
			const webcamAvatar = this.localUsersSrv.getAvatar();
			await this.webcamSession.connect(token, { clientData: webcamUsername, avatar: webcamAvatar });
		}
	}
	disconnectWebcamSession(): void {
		if (this.webcamSession) {
			this.log.d('Disconnecting webcam session');
			this.webcamSession.disconnect();
			this.webcamSession = null;
		}
	}

	async connectScreenSession(token: string): Promise<any> {
		if (!!token) {
			this.log.d('Connecting screen session');
			const screenUsername = this.localUsersSrv.getScreenUserName();
			const webcamAvatar = this.localUsersSrv.getAvatar();
			await this.screenSession.connect(token, { clientData: screenUsername, avatar: webcamAvatar });
		}
	}
	disconnectScreenSession(): void {
		if (this.screenSession) {
			this.log.d('Disconnecting screen session');
			this.screenSession.disconnect();
			this.screenSession = null;
		}
	}

	disconnect() {
		this.disconnectWebcamSession();
		this.disconnectScreenSession();
		this.videoSource = undefined;
		this.audioSource = undefined;
		this.stopVideoTracks(this.localUsersSrv.getWebcamPublisher()?.stream?.getMediaStream());
		this.stopVideoTracks(this.localUsersSrv.getScreenPublisher()?.stream?.getMediaStream());
		this.stopAudioTracks(this.localUsersSrv.getWebcamPublisher()?.stream?.getMediaStream());
		this.stopAudioTracks(this.localUsersSrv.getScreenPublisher()?.stream?.getMediaStream());
	}

	initPublisher(targetElement: string | HTMLElement, properties: PublisherProperties): Publisher {
		this.log.d('Initializing publisher with properties: ', properties);

		const publisher = this.OV.initPublisher(targetElement, properties);
		// this.localUsersSrv.setWebcamPublisher(publisher);
		publisher.once('streamPlaying', () => {
			(<HTMLElement>publisher.videos[0].video).parentElement.classList.remove('custom-class');
		});
		return publisher;
	}

	async initPublisherAsync(targetElement: string | HTMLElement, properties: PublisherProperties): Promise<Publisher> {
		this.log.d('Initializing publisher with properties: ', properties);

		const publisher = await this.OV.initPublisherAsync(targetElement, properties);
		// this.localUsersSrv.setWebcamPublisher(publisher);
		publisher.once('streamPlaying', () => {
			(<HTMLElement>publisher.videos[0].video).parentElement.classList.remove('custom-class');
		});
		return publisher;
	}

	destroyWebcamPublisher(): void {
		const publisher = this.localUsersSrv.getWebcamPublisher();
		if (!!publisher) {
			// publisher.off('streamAudioVolumeChange');
			if (publisher.stream.getWebRtcPeer()) {
				publisher.stream.disposeWebRtcPeer();
			}
			publisher.stream.disposeMediaStream();
			this.localUsersSrv.setWebcamPublisher(publisher);
		}
	}

	destroyScreenPublisher(): void {
		const publisher = this.localUsersSrv.getScreenPublisher();

		if (!!publisher) {
			// publisher.off('streamAudioVolumeChange');
			if (publisher.stream.getWebRtcPeer()) {
				publisher.stream.disposeWebRtcPeer();
			}
			publisher.stream.disposeMediaStream();
			this.localUsersSrv.setScreenPublisher(publisher);
		}
	}

	async publishWebcamPublisher(): Promise<any> {
		if (this.webcamSession?.capabilities?.publish) {
			const publisher = this.localUsersSrv.getWebcamPublisher();
			if (!!publisher) {
				return await this.webcamSession.publish(publisher);
			}
		}
		this.log.e('Webcam publisher cannot be published');
	}
	unpublishWebcamPublisher(): void {
		const publisher = this.localUsersSrv.getWebcamPublisher();
		if (!!publisher) {
			this.publishScreenAudio(this.localUsersSrv.hasWebcamAudioActive());
			this.webcamSession.unpublish(publisher);
		}
	}
	async publishScreenPublisher(): Promise<any> {
		if (this.screenSession?.capabilities?.publish) {
			const publisher = this.localUsersSrv.getScreenPublisher();
			if (!!publisher) {
				return await this.screenSession.publish(publisher);
			}
		}
		this.log.e('Screen publisher cannot be published');
	}

	unpublishScreenPublisher(): void {
		const publisher = this.localUsersSrv.getScreenPublisher();
		if (!!publisher) {
			this.screenSession.unpublish(publisher);
		}
	}
	publishWebcamVideo(active: boolean): void {
		this.localUsersSrv.getWebcamPublisher().publishVideo(active);
		// Send event to subscribers because of video has changed and view must update
		this.localUsersSrv.updateUsersStatus();
	}
	publishWebcamAudio(active: boolean): void {
		const publisher = this.localUsersSrv.getWebcamPublisher();
		if (!!publisher) {
			publisher.publishAudio(active);
		}
	}
	publishScreenAudio(active: boolean): void {
		const publisher = this.localUsersSrv.getScreenPublisher();
		if (!!publisher) {
			publisher.publishAudio(active);
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
			this.destroyWebcamPublisher();
			const properties = this.createPublisherProperties(
				this.videoSource,
				this.audioSource,
				this.localUsersSrv.hasWebcamVideoActive(),
				this.localUsersSrv.hasWebcamAudioActive(),
				mirror
			);

			const publisher = this.initPublisher(undefined, properties);
			this.localUsersSrv.setWebcamPublisher(publisher);

			publisher.once('streamPlaying', () => {
				this.localUsersSrv.setWebcamPublisher(publisher);
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

	sendSignal(type: Signal, connection?: Connection, data?: any): void {
		const signalOptions: SignalOptions = {
			data: JSON.stringify(data),
			type: type,
			to: connection ? [connection] : undefined
		};
		this.webcamSession.signal(signalOptions);
		// signalOptions.data = JSON.stringify({nickname: this.getScreenUserName()});
		// this.getScreenSession()?.signal(signalOptions);
	}

	// TODO: replace function by sendSignal
	sendNicknameSignal(connection?: Connection) {
		if (this.needSendNicknameSignal()) {
			const signalOptions: SignalOptions = {
				data: JSON.stringify({ clientData: this.localUsersSrv.getWebcamUserName() }),
				type: 'nicknameChanged',
				to: connection ? [connection] : undefined
			};
			this.getWebcamSession()?.signal(signalOptions);
			signalOptions.data = JSON.stringify({ clientData: this.localUsersSrv.getScreenUserName() });
			this.getScreenSession()?.signal(signalOptions);
		}
	}

	createPublisherProperties(
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

	async replaceScreenTrack() {
		const videoSource = ScreenType.SCREEN;
		const hasAudio = !this.localUsersSrv.isWebCamEnabled();
		const properties = this.createPublisherProperties(videoSource, undefined, true, hasAudio, false);

		this.stopScreenTracks();
		this.screenMediaStream = await this.OVScreen.getUserMedia(properties);
		await this.localUsersSrv.getScreenPublisher().replaceTrack(this.screenMediaStream.getVideoTracks()[0]);
	}

	stopAudioTracks(mediaStream: MediaStream) {
		mediaStream?.getAudioTracks().forEach((track) => {
			track.stop();

			track.enabled = false;
		});
		this.webcamMediaStream?.getAudioTracks().forEach((track) => {
			track.stop();
		});
	}

	stopVideoTracks(mediaStream: MediaStream) {
		mediaStream?.getVideoTracks().forEach((track) => {
			track.stop();
		});
	}

	needSendNicknameSignal(): boolean {
		const oldNickname: string = JSON.parse(this.webcamSession.connection.data).clientData;
		return oldNickname !== this.localUsersSrv.getWebcamUserName();
	}

	isMyOwnConnection(connectionId: string): boolean {
		return (
			this.webcamSession?.connection?.connectionId === connectionId || this.screenSession?.connection?.connectionId === connectionId
		);
	}

	getSessionOfUserConnected(): Session {
		return this.localUsersSrv.isWebCamEnabled() ? this.webcamSession : this.screenSession;
	}

	private stopScreenTracks() {
		if (this.screenMediaStream) {
			this.stopAudioTracks(this.screenMediaStream);
			this.stopVideoTracks(this.screenMediaStream);
		}
	}
}
