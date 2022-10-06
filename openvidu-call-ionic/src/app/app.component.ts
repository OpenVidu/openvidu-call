
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Platform } from '@ionic/angular';
import { RestService } from './services/rest.service';

import { RecordingInfo, TokenModel, RecordingService } from 'openvidu-angular';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit {

	ANDROID_PERMISSIONS = [
		this.androidPermissions.PERMISSION.CAMERA,
		this.androidPermissions.PERMISSION.RECORD_AUDIO,
		this.androidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS
	];

	sessionId = 'daily-call';
	tokens: TokenModel;

	joinSessionClicked = false;
	closeClicked = false;
	isSessionAlive = false;
	recordingList: RecordingInfo[] = [];
	recordingError: any;

	constructor(
		private restService: RestService,
		private platform: Platform,
		private androidPermissions: AndroidPermissions,
	) {}
	async ngOnInit() {
		const response = await this.restService.getTokensFromBackend(this.sessionId);
		this.recordingList = response.recordings;
		this.tokens = {
			webcam: response.cameraToken,
			screen: response.screenToken
		};
		console.log(this.tokens);
	}

	ngOnDestroy() {}

	onJoinClicked() {
		console.warn('VC JOIN BUTTON CLICKED');
	}

	onToolbarCameraButtonClicked() {
		console.warn('VC camera CLICKED');
	}
	onToolbarMicrophoneButtonClicked() {
		console.warn('VC microphone CLICKED');
	}
	onToolbarScreenshareButtonClicked() {
		console.warn('VC screenshare CLICKED');
	}
	onToolbarFullscreenButtonClicked() {
		console.warn('VC fullscreen CLICKED');
	}
	onToolbarParticipantsPanelButtonClicked() {
		console.warn('VC participants CLICKED');
	}
	onToolbarChatPanelButtonClicked() {
		console.warn('VC chat CLICKED');
	}

	onToolbarLeaveButtonClicked() {
		this.isSessionAlive = false;
		console.log('VC LEAVE BUTTON CLICKED');
	}

	onCameraButtonClicked() {
		console.warn('TOOLBAR camera CLICKED');
	}
	onMicrophoneButtonClicked() {
		console.warn('TOOLBAR microphone CLICKED');
	}
	onScreenshareButtonClicked() {
		console.warn('TOOLBAR screenshare CLICKED');
	}
	onFullscreenButtonClicked() {
		console.warn('TOOLBAR fullscreen CLICKED');
	}
	onParticipantsPanelButtonClicked() {
		console.warn('TOOLBAR participants CLICKED');
	}
	onChatPanelButtonClicked() {
		console.warn('TOOLBAR chat CLICKED');
	}

	onLeaveButtonClicked() {
		this.isSessionAlive = false;
		console.log('TOOLBAR LEAVE CLICKED');
	}

	async onStartRecordingClicked() {
		console.warn('START RECORDING CLICKED');
		try {
			await this.restService.startRecording(this.sessionId);
		} catch (error) {
			this.recordingError = error;
		}
	}
	async onStopRecordingClicked() {
		console.warn('STOP RECORDING CLICKED');
		try {
			// await this.restService.startRecording(this.sessionId);

			this.recordingList = await this.restService.stopRecording(this.sessionId);
			console.log('RECORDING LIST ', this.recordingList);
		} catch (error) {
			this.recordingError = error;
		}
	}

	async onDeleteRecordingClicked(recordingId: string) {
		console.warn('DELETE RECORDING CLICKED');

		try {
			this.recordingList = await this.restService.deleteRecording(recordingId);
		} catch (error) {
			this.recordingError = error;
		}
	}

	private async checkAndroidPermissions(): Promise<void> {
		await this.platform.ready();
		try {
			await this.androidPermissions.requestPermissions(this.ANDROID_PERMISSIONS);
			const promisesArray: Promise<any>[] = [];
			this.ANDROID_PERMISSIONS.forEach((permission) => {
				console.log('Checking ', permission);
				promisesArray.push(this.androidPermissions.checkPermission(permission));
			});
			const responses = await Promise.all(promisesArray);
			let allHasPermissions = true;
			responses.forEach((response, i) => {
				allHasPermissions = response.hasPermission;
				if (!allHasPermissions) {
					throw new Error('Permissions denied: ' + this.ANDROID_PERMISSIONS[i]);
				}
			});
		} catch (error) {
			console.error('Error requesting or checking permissions: ', error);
			throw error;
		}
	}
}
