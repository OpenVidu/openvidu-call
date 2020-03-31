import { Component, OnInit, Output, EventEmitter, Input, HostListener, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { UserModel } from '../../models/user-model';
import { NicknameMatcher } from '../../forms-matchers/nickname';
import { UtilsService } from '../../services/utils/utils.service';
import { Publisher } from 'openvidu-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { OvSettings } from '../../types/ov-settings';
import { OpenViduSessionService } from '../../services/openvidu-session/openvidu-session.service';
import { IDevice, CameraType } from '../../types/device-type';
import { DevicesService } from '../../services/devices/devices.service';
import { Subscription } from 'rxjs';
import { AvatarType } from '../../types/chat-type';
import { LoggerService } from '../../services/logger/logger.service';
import { ILogger } from '../../types/logger-type';
import { ScreenType } from '../../types/video-type';

@Component({
	selector: 'app-room-config',
	templateUrl: './room-config.component.html',
	styleUrls: ['./room-config.component.css']
})
export class RoomConfigComponent implements OnInit, OnDestroy {
	@Input() userNickname: string;
	@Input() sessionName: string;
	@Input() ovSettings: OvSettings;
	@Output() join = new EventEmitter<any>();
	@Output() leaveSession = new EventEmitter<any>();

	readonly MESSAGE_ERROR =
		'It looks like that you do not have any cameras available on your PC. Please, check your devices and connect a webcam to start :)';

	mySessionId: string;

	cameras: IDevice[];
	microphones: IDevice[];
	camSelected: IDevice;
	micSelected: IDevice;
	isVideoActive = true;
	isAudioActive = true;
	isScreenShareActive = false;
	volumeValue = 100;
	showDialogExtension = false;

	oVUsersSubscription: Subscription;
	localUsers: UserModel[] = [];
	randomAvatar: string;
	videoAvatar: string;
	avatarSelected: AvatarType;
	columns: number;

	nicknameFormControl = new FormControl('', [Validators.maxLength(25), Validators.required]);
	matcher = new NicknameMatcher();
	private log: ILogger;

	constructor(
		private route: ActivatedRoute,
		private utilsSrv: UtilsService,
		private oVSessionService: OpenViduSessionService,
		private oVDevicesService: DevicesService,
		private loggerSrv: LoggerService
	) {
		this.log = this.loggerSrv.get('RoomConfigComponent');
	}

	@HostListener('window:beforeunload')
	beforeunloadHandler() {
		this.close();
	}

	async ngOnInit() {
		const webcamAvailable = await this.oVDevicesService.isWebcamAvailable();
		if (!webcamAvailable) {
			this.utilsSrv.showErrorMessage('Devices Error', this.MESSAGE_ERROR);
			return;
		}
		// Subscribe to users
		this.oVUsersSubscription = this.oVSessionService.OVUsers.subscribe(users => {
			this.localUsers = users;
		});

		this.setNicknameForm();
		this.setSessionName();

		const videoSource = this.camSelected ? this.camSelected.device : undefined;
		const audioSource = this.micSelected ? this.micSelected.device : undefined;
		const publishAudio = this.isAudioActive;
		const publishVideo = this.isVideoActive;
		const mirror = this.camSelected && this.camSelected.type === CameraType.FRONT;

		const properties = this.oVSessionService.createProperties(videoSource, audioSource, publishVideo, publishAudio, mirror);

		const publisher = this.oVSessionService.initCamPublisher(undefined, properties);

		if (this.ovSettings.autopublish) {
			this.joinSession();
		}
		// publisher.on('streamAudioVolumeChange', (event: any) => {
		//   this.volumeValue = Math.round(Math.abs(event.value.newValue));
		// });

		publisher.once('accessAllowed', () => {
			this.initDevices(publisher);
		});

		this.setRandomAvatar();
		this.columns = window.innerWidth > 900 ? 2 : 1;
	}

	ngOnDestroy() {
		this.oVUsersSubscription.unsubscribe();
	}

	async onCameraSelected(event: any) {
		const videoSource = event?.value;

		if (this.oVDevicesService.deviceHasValue(videoSource)) {
			// Is New deviceId different from the old one?
			if (this.oVDevicesService.needUpdateVideoTrack(videoSource)) {
				await this.oVSessionService.replaceTrack(videoSource, null);
				this.oVDevicesService.setCamSelected(videoSource);
			}
			// Publish Webcam
			this.oVSessionService.publishVideo(true);
			this.isVideoActive = true;
		} else {
			// Unpublish webcam
			this.oVSessionService.publishVideo(false);
			this.isVideoActive = false;
		}
	}

	async onMicrophoneSelected(event: any) {
		const audioSource = event?.value;

		if (this.oVDevicesService.deviceHasValue(audioSource)) {
			// Is New deviceId different than older?
			if (this.oVDevicesService.needUpdateAudioTrack(audioSource)) {
				await this.oVSessionService.replaceTrack(null, audioSource);
				this.oVDevicesService.setMicSelected(audioSource);
			}
			// Publish microphone
			this.publishAudio(true);
			this.isAudioActive = true;
		} else {
			// Unpublish microhpone
			this.publishAudio(false);
			this.isAudioActive = false;
		}
	}

	toggleCam() {
		this.isVideoActive = !this.isVideoActive;
		this.oVSessionService.publishVideo(this.isVideoActive);

		if (this.oVSessionService.areBothConnected()) {
			this.oVSessionService.disableWebcamUser();
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

			screenPublisher.on('accessAllowed', event => {
				this.oVSessionService.enableScreenUser(screenPublisher);
				if (!this.oVSessionService.hasWebcamVideoActive()) {
					this.oVSessionService.disableWebcamUser();
				}
			});

			screenPublisher.on('accessDenied', event => {
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
		if (this.userNickname) {
			this.nicknameFormControl.setValue(this.userNickname);
			return;
		}
		this.nicknameFormControl.setValue(this.utilsSrv.generateNickname());
	}

	eventKeyPress(event) {
		if (event && event.keyCode === 13 && this.nicknameFormControl.valid) {
			this.joinSession();
		}
	}

	onResize(event) {
		this.columns = event.target.innerWidth > 900 ? 2 : 1;
	}

	updateVolumeColor(): string {
		// max = 0 / min = 100
		if (this.volumeValue <= 20) {
			return 'warn';
		} else if (this.volumeValue > 20 && this.volumeValue <= 35) {
			return 'accent';
		} else if (this.volumeValue > 35) {
			return 'primary';
		}
	}

	joinSession() {
		if (this.nicknameFormControl.valid) {
			// this.localUsers.forEach(user => {
			// 	user.getStreamManager().off('streamAudioVolumeChange');
			// 	user.setNickname(this.nicknameFormControl.value);
			// });
			// if (this.avatarSelected === AVATAR_TYPE.RANDOM) {
			// 	this.localUsers[0].removeVideoAvatar();
			// }
			// if (this.localUsers[1]) {
			// 	this.localUsers[1].setUserAvatar(this.localUsers[0].getAvatar());
			// }
			this.join.emit();
		}
	}

	toggleDialogExtension() {
		this.showDialogExtension = !this.showDialogExtension;
	}

	close() {
		this.oVSessionService.destroyUsers();
		this.leaveSession.emit();
	}

	setAvatar(avatarType: AvatarType) {
		// !! REFACTOR
		if ((avatarType === AvatarType.RANDOM && this.randomAvatar) || (avatarType === AvatarType.VIDEO && this.videoAvatar)) {
			this.avatarSelected = avatarType;
			// if (avatarType === AVATAR_TYPE.RANDOM) {
			//   this.localUsers[0].setUserAvatar(this.randomAvatar);
			// }
		}
	}

	private async initDevices(publisher: Publisher) {
		await this.oVDevicesService.initDevices(publisher);

		this.microphones = this.oVDevicesService.getMicrophones();
		this.cameras = this.oVDevicesService.getCameras();
		this.camSelected = this.oVDevicesService.getCamSelected();
		this.micSelected = this.oVDevicesService.getMicSelected();
	}

	private setSessionName() {
		this.route.params.subscribe((params: Params) => {
			this.mySessionId = this.sessionName ? this.sessionName : params.roomName;
			this.oVSessionService.setSessionId(this.mySessionId);
		});
	}

	private setRandomAvatar() {
		this.randomAvatar = this.utilsSrv.getOpeViduAvatar();
		this.oVSessionService.setAvatar(AvatarType.RANDOM, this.randomAvatar);
		this.avatarSelected = AvatarType.RANDOM;
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
			if (error && error.name === 'SCREEN_EXTENSION_NOT_INSTALLED') {
				this.toggleDialogExtension();
			} else {
				this.utilsSrv.handlerScreenShareError(error);
			}
		}
	}

	private publishAudio(audio: boolean) {
		this.oVSessionService.isWebCamEnabled()
			? this.oVSessionService.publishWebcamAudio(audio)
			: this.oVSessionService.publishScreenAudio(audio);
	}
}
