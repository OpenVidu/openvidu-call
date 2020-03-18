import { Injectable } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { OpenVidu, PublisherProperties, Publisher } from 'openvidu-browser';
import { BehaviorSubject, Observable } from 'rxjs';

export enum AVATAR_TYPE {
	RANDOM = 'random',
	VIDEO = 'video'
}

@Injectable({
	providedIn: 'root'
})
export class OpenViduSessionService {
	OVUsers: Observable<UserModel[]>;
	private _OVUsers = <BehaviorSubject<UserModel[]>>new BehaviorSubject([]);
	private OV: OpenVidu = null;

	private webCamUser: UserModel;
	private screenUser: UserModel;

	private videoSource = '';
	private audioSource = '';

	constructor() {
		this.OVUsers = this._OVUsers.asObservable();
		this.webCamUser = new UserModel();
		this.OV = new OpenVidu();
		this._OVUsers.next([this.webCamUser]);
	}

	toggleWebCam() {
		this.webCamUser.setVideoActive(!this.webCamUser.isVideoActive());
		(<Publisher>this.webCamUser.getStreamManager()).publishVideo(this.webCamUser.isVideoActive());
	}

	enableWebCamUser() {
		this._OVUsers.next([this.webCamUser, this.screenUser]);
	}

	disableWebCamUser() {
		// this.destryoWebCamUser();
		this._OVUsers.next([this.screenUser]);
		this.webCamUser.setScreenShareActive(true);
	}

	publishVideo(isVideoActive: boolean) {
		this.webCamUser.setVideoActive(isVideoActive);
		(<Publisher>this.webCamUser.getStreamManager()).publishVideo(isVideoActive);
	}

	publishAudio(isAudioActive: boolean) {
		this.webCamUser.setAudioActive(isAudioActive);
		(<Publisher>this.webCamUser.getStreamManager()).publishAudio(isAudioActive);
	}

	enableScreenUser(screenPublisher: Publisher) {
		const hasAudio = this.webCamUser.isVideoActive() ? false : this.webCamUser.isAudioActive();
		this.screenUser = new UserModel();
		this.screenUser.setScreenShareActive(true);
		this.webCamUser.setScreenShareActive(false);

		this.screenUser.setType('screen');
		this.screenUser.setAudioActive(hasAudio);
		this.screenUser.setUserAvatar(this.webCamUser.getAvatar());
		this.screenUser.setStreamManager(screenPublisher);

		if (this.isWebCamEnabled() && !this.hasWebCamVideoActive()) {
			this.disableWebCamUser();
			// Enabling webcam user audio
			this.webCamUser.setAudioActive(true);
			(<Publisher>this.webCamUser.getStreamManager()).publishAudio(true);
			this._OVUsers.next([this.screenUser]);
			return;
		}
		this._OVUsers.next([this.webCamUser, this.screenUser]);
	}

	disableScreenUser() {
		this.destryoScreenUser();
		this.webCamUser.setScreenShareActive(false);
		this._OVUsers.next([this.webCamUser]);
	}

	initCamPublisher(targetElement: string | HTMLElement, properties: PublisherProperties): Publisher {
		const publisher = this.initPublisher(targetElement, properties);
		this.webCamUser.setStreamManager(publisher);
		return publisher;
	}

	updateAudioDevice(source: string) {
		this.audioSource = source;

		const properties: PublisherProperties = {
			audioSource: source,
			videoSource: this.videoSource,
			publishAudio: this.webCamUser.isAudioActive(),
			publishVideo: this.webCamUser.isVideoActive()
		};

		this.initCamPublisher(undefined, properties);
	}

	replaceTrack(videoSource: string, audioSource: string) {
		if (!!videoSource) {
			this.videoSource = videoSource;
		}
		if (!!audioSource) {
			this.audioSource = audioSource;
		}

		const properties: PublisherProperties = {
			audioSource: this.audioSource,
			videoSource: this.videoSource,
			publishAudio: this.webCamUser.isAudioActive(),
			publishVideo: this.webCamUser.isVideoActive()
		};

		this.OV.getUserMedia(properties).then(mediaStream => {
			const track = mediaStream.getVideoTracks()[0];
			(<Publisher>this.webCamUser.getStreamManager()).replaceTrack(track);
		});

		//this.initCamPublisher(undefined, properties);
	}

	initScreenPublisher(targetElement: string | HTMLElement, properties: PublisherProperties): Publisher {
		const publisher = this.initPublisher(targetElement, properties);
		return publisher;
	}

	setAvatar(option: AVATAR_TYPE, avatar?: string): void {
		if ((option === AVATAR_TYPE.RANDOM && avatar) || (AVATAR_TYPE.VIDEO && avatar)) {
			if (option === AVATAR_TYPE.RANDOM) {
				this.webCamUser.setUserAvatar(avatar);
			}
		}
	}

	destroyUsers() {
		this.destryoScreenUser();
		this.destryoWebCamUser();
		// Initial state
		this._OVUsers.next([this.webCamUser]);
	}

	// getDevices(): Promise<Device[]> {
	//   return this.OV.getDevices();
	// }

	isWebCamEnabled(): boolean {
		return this._OVUsers.value[0].isLocal();
	}

	hasWebCamVideoActive(): boolean {
		return this.webCamUser.isVideoActive();
	}

	areBothConnected(): boolean {
		return this._OVUsers.value.length === 2;
	}

	isOnlyScreenConnected(): boolean {
		return this._OVUsers.value[0].isScreen();
	}

	isScreenShareEnabled(): boolean {
		return this.areBothConnected() || this.isOnlyScreenConnected();
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

	private destryoWebCamUser() {
		if (this.webCamUser?.getStreamManager()) {
			this.webCamUser.getStreamManager().off('streamAudioVolumeChange');
			this.webCamUser.getStreamManager().stream.disposeWebRtcPeer();
			this.webCamUser.getStreamManager().stream.disposeMediaStream();
		}
	}
}
