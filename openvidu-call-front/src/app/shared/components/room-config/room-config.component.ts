import { Component, OnInit, Output, EventEmitter, Input, HostListener, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { UserModel } from '../../models/user-model';
import { NicknameMatcher } from '../../forms-matchers/nickname';
import { UtilsService } from '../../services/utils/utils.service';
import { Publisher } from 'openvidu-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { OpenViduSessionService } from '../../services/openvidu-session/openvidu-session.service';
import { IDevice, CameraType } from '../../types/device-type';
import { DevicesService } from '../../services/devices/devices.service';
import { Subscription } from 'rxjs';
import { AvatarType } from '../../types/chat-type';
import { LoggerService } from '../../services/logger/logger.service';
import { ILogger } from '../../types/logger-type';
import { ScreenType } from '../../types/video-type';
import { ExternalConfigModel } from '../../models/external-config';
import { OvSettingsModel } from '../../models/ovSettings';
import { StorageService } from '../../services/storage/storage.service';

@Component({
	selector: 'app-room-config',
	templateUrl: './room-config.component.html',
	styleUrls: ['./room-config.component.css']
})
export class RoomConfigComponent implements OnInit, OnDestroy {

	private readonly USER_NICKNAME = 'openviduCallNickname';
	@ViewChild('bodyCard') bodyCard: ElementRef;

	@Input() externalConfig: ExternalConfigModel;
	@Input() ovSettings: OvSettingsModel;
	@Output() join = new EventEmitter<any>();
	@Output() leaveSession = new EventEmitter<any>();

	// Webcomponent event
	@Output() publisherCreated = new EventEmitter<any>();

	mySessionId: string;

	cameras: IDevice[];
	microphones: IDevice[];
	camSelected: IDevice;
	micSelected: IDevice;
	isVideoActive = true;
	isAudioActive = true;
	// volumeValue = 100;
	oVUsersSubscription: Subscription;
	localUsers: UserModel[] = [];
	randomAvatar: string;
	videoAvatar: string;
	avatarSelected: AvatarType;
	columns: number;

	nicknameFormControl = new FormControl('', [Validators.maxLength(25), Validators.required]);
	matcher = new NicknameMatcher();
	hasVideoDevices: boolean;
	hasAudioDevices: boolean;
	showConfigCard: boolean;
	private log: ILogger;

	constructor(
		private route: ActivatedRoute,
		private utilsSrv: UtilsService,
		public oVSessionService: OpenViduSessionService,
		private oVDevicesService: DevicesService,
		private loggerSrv: LoggerService,
		private storageSrv: StorageService,

	) {
		this.log = this.loggerSrv.get('RoomConfigComponent');
	}

	@HostListener('window:beforeunload')
	beforeunloadHandler() {
		this.close();
	}

	async ngOnInit() {
		this.subscribeToUsers();
		this.setNicknameForm();
		this.setRandomAvatar();
		this.columns = window.innerWidth > 900 ? 2 : 1;
		this.setSessionName();
		await this.oVDevicesService.initDevices();
		this.setDevicesInfo();
		this.initwebcamPublisher();

		// publisher.on('streamAudioVolumeChange', (event: any) => {
		//   this.volumeValue = Math.round(Math.abs(event.value.newValue));
		// });
	}

	ngOnDestroy() {
		this.oVUsersSubscription.unsubscribe();
	}

	async onCameraSelected(event: any) {
		const videoSource = event?.value;
		if (!!videoSource) {
			// Is New deviceId different from the old one?
			if (this.oVDevicesService.needUpdateVideoTrack(videoSource)) {
				const mirror = this.oVDevicesService.cameraNeedsMirror(videoSource);
				await this.oVSessionService.replaceTrack(videoSource, null, mirror);
				this.oVDevicesService.setCamSelected(videoSource);
				this.camSelected = this.oVDevicesService.getCamSelected();
			}
			// Publish Webcam
			this.oVSessionService.publishVideo(true);
			this.isVideoActive = true;
			return;
		}
		// Unpublish webcam
		this.oVSessionService.publishVideo(false);
		this.isVideoActive = false;
	}

	async onMicrophoneSelected(event: any) {
		const audioSource = event?.value;

		if (!!audioSource) {
			// Is New deviceId different than older?
			if (this.oVDevicesService.needUpdateAudioTrack(audioSource)) {
				console.log(this.camSelected);
				const mirror = this.oVDevicesService.cameraNeedsMirror(this.camSelected.device);
				await this.oVSessionService.replaceTrack(null, audioSource, mirror);
				this.oVDevicesService.setMicSelected(audioSource);
				this.micSelected = this.oVDevicesService.getMicSelected();
			}
			// Publish microphone
			this.publishAudio(true);
			this.isAudioActive = true;
			return;
		}
		// Unpublish microhpone
		this.publishAudio(false);
		this.isAudioActive = false;
	}

	toggleCam() {
		this.isVideoActive = !this.isVideoActive;
		this.oVSessionService.publishVideo(this.isVideoActive);

		if (this.oVSessionService.areBothConnected()) {
			this.oVSessionService.disableWebcamUser();
			this.oVSessionService.publishScreenAudio(this.isAudioActive);
			// !this.subscribeToVolumeChange(<Publisher>this.localUsers[0].getStreamManager());
		} else if (this.oVSessionService.isOnlyScreenConnected()) {
			// (<Publisher>this.localUsers[0].getStreamManager()).off('streamAudioVolumeChange');
			this.oVSessionService.enableWebcamUser();
		}
	}

	toggleScreenShare() {
		if (this.oVSessionService.areBothConnected()) {
			this.oVSessionService.disableScreenUser();
			return;
		}

		if (this.oVSessionService.isOnlyWebcamConnected()) {
			const screenPublisher = this.initScreenPublisher();

			screenPublisher.on('accessAllowed', (event) => {
				this.oVSessionService.enableScreenUser(screenPublisher);
				if (!this.oVSessionService.hasWebcamVideoActive()) {
					this.oVSessionService.disableWebcamUser();
				}
			});

			screenPublisher.on('accessDenied', (event) => {
				this.log.w('ScreenShare: Access Denied');
			});
			return;
		}
		this.oVSessionService.enableWebcamUser();
		this.oVSessionService.disableScreenUser();
	}

	toggleMic() {
		this.isAudioActive = !this.isAudioActive;
		this.publishAudio(this.isAudioActive);
	}

	takePhoto() {
		this.oVSessionService.setWebcamAvatar();
		this.videoAvatar = this.oVSessionService.getWebCamAvatar();
		this.oVSessionService.setAvatar(AvatarType.VIDEO);
	}

	setNicknameForm() {
		if (this.externalConfig) {
			this.nicknameFormControl.setValue(this.externalConfig.getNickname());
			return;
		}
		const nickname = this.storageSrv.get(this.USER_NICKNAME) || this.utilsSrv.generateNickname();
		this.nicknameFormControl.setValue(nickname);
	}

	eventKeyPress(event) {
		if (event && event.keyCode === 13 && this.nicknameFormControl.valid) {
			this.joinSession();
		}
	}

	onResize(event) {
		this.columns = event.target.innerWidth > 900 ? 2 : 1;
	}

	// updateVolumeColor(): string {
	// 	// max = 0 / min = 100
	// 	if (this.volumeValue <= 20) {
	// 		return 'warn';
	// 	} else if (this.volumeValue > 20 && this.volumeValue <= 35) {
	// 		return 'accent';
	// 	} else if (this.volumeValue > 35) {
	// 		return 'primary';
	// 	}
	// }

	joinSession() {
		if (this.nicknameFormControl.valid) {
			// this.localUsers.forEach(user => {
			// 	user.getStreamManager().off('streamAudioVolumeChange');
			// });
			// if (this.avatarSelected === AVATAR_TYPE.RANDOM) {
			// 	this.localUsers[0].removeVideoAvatar();
			// }
			// if (this.localUsers[1]) {
			// 	this.localUsers[1].setUserAvatar(this.localUsers[0].getAvatar());
			// }
			this.oVSessionService.setWebcamName(this.nicknameFormControl.value);
			this.storageSrv.set(this.USER_NICKNAME, this.nicknameFormControl.value);
			this.join.emit();
		}
		this.scrollToBottom();
	}

	close() {
		this.leaveSession.emit();
		this.showConfigCard = false;
	}

	setAvatar(avatar: string) {
		// !! REFACTOR
		const avatarType = avatar === AvatarType.VIDEO ? AvatarType.VIDEO : AvatarType.RANDOM;
		if ((avatarType === AvatarType.RANDOM && this.randomAvatar) || (avatarType === AvatarType.VIDEO && this.videoAvatar)) {
			this.avatarSelected = avatarType;
			// if (avatarType === AVATAR_TYPE.RANDOM) {
			//   this.localUsers[0].setUserAvatar(this.randomAvatar);
			// }
		}
	}

	private setDevicesInfo() {
		this.hasVideoDevices = this.oVDevicesService.hasVideoDeviceAvailable();
		this.hasAudioDevices = this.oVDevicesService.hasAudioDeviceAvailable();
		this.microphones = this.oVDevicesService.getMicrophones();
		this.cameras = this.oVDevicesService.getCameras();
		this.camSelected = this.oVDevicesService.getCamSelected();
		this.micSelected = this.oVDevicesService.getMicSelected();
	}

	private setSessionName() {
		this.route.params.subscribe((params: Params) => {
			this.mySessionId = this.externalConfig ? this.externalConfig.getSessionName() : params.roomName;
			this.oVSessionService.setSessionId(this.mySessionId);
		});
	}

	private setRandomAvatar() {
		this.randomAvatar = this.utilsSrv.getOpenViduAvatar();
		this.oVSessionService.setAvatar(AvatarType.RANDOM, this.randomAvatar);
		this.avatarSelected = AvatarType.RANDOM;
	}

	private scrollToBottom(): void {
		try {
			this.bodyCard.nativeElement.scrollTop = this.bodyCard.nativeElement.scrollHeight;
		} catch (err) {
		}
	}

	private initScreenPublisher(): Publisher {
		const videoSource = ScreenType.SCREEN;
		const willThereBeWebcam = this.oVSessionService.isWebCamEnabled() && this.oVSessionService.hasWebcamVideoActive();
		const hasAudio = willThereBeWebcam ? false : this.isAudioActive;
		const properties = this.oVSessionService.createProperties(videoSource, undefined, true, hasAudio, false);

		try {
			return this.oVSessionService.initScreenPublisher(undefined, properties);
		} catch (error) {
			this.log.e(error);
			this.utilsSrv.handlerScreenShareError(error);
		}
	}

	private publishAudio(audio: boolean) {
		this.oVSessionService.isWebCamEnabled()
			? this.oVSessionService.publishWebcamAudio(audio)
			: this.oVSessionService.publishScreenAudio(audio);
	}

	private subscribeToUsers() {
		this.oVUsersSubscription = this.oVSessionService.OVUsers.subscribe((users) => {
			this.localUsers = users;
		});
	}

	private initwebcamPublisher() {
		const micStorageDevice = this.micSelected?.device || undefined;
		const camStorageDevice = this.camSelected?.device || undefined;

		const videoSource =  this.hasVideoDevices ? camStorageDevice : false;
		const audioSource = this.hasAudioDevices ? micStorageDevice : false;
		const publishAudio = this.hasAudioDevices ? this.isAudioActive : false;
		const publishVideo = this.hasVideoDevices ? this.isVideoActive : false;
		const mirror = this.camSelected && this.camSelected.type === CameraType.FRONT;
		const properties = this.oVSessionService.createProperties(videoSource, audioSource, publishVideo, publishAudio, mirror);
		const publisher = this.oVSessionService.initCamPublisher(undefined, properties);
		this.handlePublisherSuccess(publisher);
		this.handlePublisherError(publisher);
	}

	private emitPublisher(publisher) {
		this.publisherCreated.emit(publisher);
	}

	private handlePublisherSuccess(publisher: Publisher) {
		publisher.once('accessAllowed', async () => {
			if (this.oVDevicesService.areEmptyLabels()) {
				await this.oVDevicesService.initDevices();
				if (this.hasAudioDevices) {
					const audioLabel = publisher.stream.getMediaStream().getAudioTracks()[0].label;
					this.oVDevicesService.setMicSelected(audioLabel);
				}

				if (this.hasVideoDevices) {
					const videoLabel = publisher.stream.getMediaStream().getVideoTracks()[0].label;
					this.oVDevicesService.setCamSelected(videoLabel);
				}
				this.setDevicesInfo();
			}
			// Emit publisher to webcomponent and angular-library
			this.emitPublisher(publisher);

			if (this.ovSettings.isAutoPublish()) {
				this.joinSession();
				return;
			}
			this.showConfigCard = true;
		});
	}

	private handlePublisherError(publisher: Publisher) {
		publisher.once('accessDenied', (e: any) => {
			let message: string;
			if (e.name === 'DEVICE_ACCESS_DENIED') {
				message = 'Access to media devices was not allowed.';
			}
			if (e.name === 'NO_INPUT_SOURCE_SET') {
				message = 'No video or audio devices have been found. Please, connect at least one.';
			}
			this.utilsSrv.showErrorMessage(e.name.replace(/_/g, ' '), message, true);
			this.log.e(e.message);
		});
	}
}
