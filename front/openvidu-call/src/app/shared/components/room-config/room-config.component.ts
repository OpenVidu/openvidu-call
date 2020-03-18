import { Component, OnInit, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { UserModel } from '../../models/user-model';
import { NicknameMatcher } from '../../forms-matchers/nickname';
import { UtilsService } from '../../services/utils/utils.service';
import { Publisher } from 'openvidu-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { OvSettings } from '../../models/ov-settings';
import { OpenViduSessionService, AVATAR_TYPE } from '../../services/openvidu-session/openvidu-session.service';
import { IDevice, CameraType } from '../../models/device-type';
import { Observable } from 'rxjs/internal/Observable';
import { DevicesService } from '../../services/devices/devices.service';

@Component({
	selector: 'app-room-config',
	templateUrl: './room-config.component.html',
	styleUrls: ['./room-config.component.css']
})
export class RoomConfigComponent implements OnInit {
	@Input() userNickname: string;
	@Input() sessionName: string;
	@Input() ovSettings: OvSettings;
	@Output() join = new EventEmitter<any>();
	@Output() leaveSession = new EventEmitter<any>();

	mySessionId: string;

	selected = 'option2';

	screenActive: 'None' | 'Screen' = 'None';
	cameras: IDevice[];
	microphones: IDevice[];
	camSelected: IDevice;
	micSelected: IDevice;
	isVideoActive = true;
	isAudioActive = true;
	isScreenShareActive = false;
	volumeValue = 100;
	showDialogExtension = false;

	_OVUsers: Observable<UserModel[]>;
	localUsers: UserModel[] = [];
	randomAvatar: string;
	videoAvatar: string;
	avatarSelected: AVATAR_TYPE;
	columns: number;

	nicknameFormControl = new FormControl('', [Validators.maxLength(25), Validators.required]);
	matcher = new NicknameMatcher();

	constructor(
		private route: ActivatedRoute,
		private utilsSrv: UtilsService,
		private OVSessionService: OpenViduSessionService,
		private OVDevicesService: DevicesService
	) {}

	@HostListener('window:beforeunload')
	beforeunloadHandler() {
		this.close();
	}

	ngOnInit() {
		this._OVUsers = this.OVSessionService.OVUsers;
		this._OVUsers.subscribe(users => {
			this.localUsers = users;
		});

		this.setNicknameForm();
		this.setSessionName();

		const properties = {
			audioSource: this.micSelected ? this.micSelected.device : undefined,
			videoSource: this.camSelected ? this.camSelected.device : undefined,
			publishAudio: this.isAudioActive,
			publishVideo: this.isVideoActive,
			mirror: this.camSelected && this.camSelected.type === CameraType.FRONT
		};

		const publisher = this.OVSessionService.initCamPublisher(undefined, properties);

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


	onCameraSelected(event: any) {

		const videoSource = event?.value;

		if (this.OVDevicesService.deviceHasValue(videoSource)) {
			// Is New deviceId different than older?
			if (this.OVDevicesService.needUpdateVideoTrack(videoSource)) {
				this.OVSessionService.replaceTrack(videoSource, null);
				this.OVDevicesService.setCamSelected(videoSource);
			}
			// Publish Webcam
			this.OVSessionService.publishVideo(true);
			this.isVideoActive = true;
			return;
		} else {
			// Unpublish webcam
			this.OVSessionService.publishVideo(false);
			this.isVideoActive = false;
		}
	}

	onMicrophoneSelected(event: any) {

		const audioSource = event?.value;

		console.log("audio device ", audioSource);

		if (this.OVDevicesService.deviceHasValue(audioSource)) {
			// Is New deviceId different than older?
			if (this.OVDevicesService.needUpdateAudioTrack(audioSource)) {
				this.OVSessionService.replaceTrack(null, audioSource);
				this.OVDevicesService.setMicSelected(audioSource);
			}
			// Publish microphone
			this.OVSessionService.publishAudio(true);
			this.isAudioActive = true;
			return;
		} else {
			// Unpublish microhpone
			this.OVSessionService.publishAudio(false);
			this.isAudioActive = false;
		}
	}


	toggleCam() {
		this.isVideoActive = !this.isVideoActive;
		if (this.OVSessionService.areBothConnected()) {
			console.log("both connected");
			this.OVSessionService.disableWebCamUser();
			// !this.setAudio(this.isAudioActive);
			// !this.subscribeToVolumeChange(<Publisher>this.localUsers[0].getStreamManager());
		} else if (this.OVSessionService.isOnlyScreenConnected()) {

			console.log("only screen share connected");
			this.setAudio(false);
			(<Publisher>this.localUsers[0].getStreamManager()).off('streamAudioVolumeChange');
			this.OVSessionService.enableWebCamUser();
			// !this.initPublisher();
		} else {
			console.log("only webcam connected");
			this.OVSessionService.toggleWebCam();
		}
	}

	toggleScreenShare() {
		if (this.OVSessionService.isScreenShareEnabled()) {
			if (this.OVSessionService.isOnlyScreenConnected()) {
				this.OVSessionService.enableWebCamUser();
			}
			this.OVSessionService.disableScreenUser();
			this.screenActive = 'None';
		} else {
			this.initScreenPublisher();
		}
	}

	toggleMic() {
		this.isAudioActive = !this.isAudioActive;
		this.localUsers.forEach(user => {
			user.setAudioActive(this.isAudioActive);
			(<Publisher>user.getStreamManager()).publishAudio(this.isAudioActive);
		});
	}

	takePhoto() {
		this.localUsers[0].setUserAvatar();
		this.videoAvatar = this.localUsers[0].getAvatar();
		this.OVSessionService.setAvatar(AVATAR_TYPE.VIDEO);
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
			this.localUsers.forEach(user => {
				user.getStreamManager().off('streamAudioVolumeChange');
				user.setNickname(this.nicknameFormControl.value);
			});
			// if (this.avatarSelected === AVATAR_TYPE.RANDOM) {
			// 	this.localUsers[0].removeVideoAvatar();
			// }
			// if (this.localUsers[1]) {
			// 	this.localUsers[1].setUserAvatar(this.localUsers[0].getAvatar());
			// }
			this.join.emit({ localUsers: this.localUsers, sessionId: this.mySessionId });
		}
	}

	toggleDialogExtension() {
		this.showDialogExtension = !this.showDialogExtension;
	}

	close() {
		this.OVSessionService.destroyUsers();
		this.leaveSession.emit();
	}

	setAvatar(avatarType: AVATAR_TYPE) {
		// !! REFACTOR
		if ((avatarType === AVATAR_TYPE.RANDOM && this.randomAvatar) || (option === AVATAR_TYPE.VIDEO && this.videoAvatar)) {
			this.avatarSelected = avatarType;
			// if (avatarType === AVATAR_TYPE.RANDOM) {
			//   this.localUsers[0].setUserAvatar(this.randomAvatar);
			// }
		  }
	}

	private async initDevices(publisher: Publisher) {
		await this.OVDevicesService.initDevices(publisher);

		this.microphones = this.OVDevicesService.getMicrophones();
		this.cameras = this.OVDevicesService.getCameras();

		this.camSelected = this.OVDevicesService.getCamSelected();
		this.micSelected = this.OVDevicesService.getMicSelected();
	}

	private setSessionName() {
		this.route.params.subscribe((params: Params) => {
			this.mySessionId = this.sessionName ? this.sessionName : params.roomName;
		});
	}

	private setRandomAvatar() {
		this.randomAvatar = this.utilsSrv.getOpeViduAvatar();
		this.OVSessionService.setAvatar(AVATAR_TYPE.RANDOM, this.randomAvatar);
		this.avatarSelected = AVATAR_TYPE.RANDOM;
	}

	private initScreenPublisher() {
		const videoSource = this.utilsSrv.isFF() ? 'window' : 'screen';
		const hasAudio = this.localUsers[0].isLocal() && this.localUsers[0].isVideoActive() ? false : this.isAudioActive;
		const publisherProperties = {
			videoSource: videoSource,
			publishAudio: hasAudio,
			publishVideo: true,
			mirror: false
		};

		try {

			const screenPublisher = this.OVSessionService.initScreenPublisher(undefined, publisherProperties);
			screenPublisher.on('accessAllowed', event => {
				this.OVSessionService.enableScreenUser(screenPublisher);
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

	private setAudio(value: boolean) {
		this.localUsers[0].setAudioActive(value);
		(<Publisher>this.localUsers[0].getStreamManager()).publishAudio(value);
	}
}
