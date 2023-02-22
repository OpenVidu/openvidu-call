import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
	BroadcastingError,
	BroadcastingService,
	BroadcastingStatus,
	ParticipantService,
	RecordingInfo,
	RecordingService,
	RecordingStatus,
	TokenModel
} from 'openvidu-angular';

import { RestService } from '../../services/rest.service';

@Component({
	selector: 'app-call',
	templateUrl: './call.component.html',
	styleUrls: ['./call.component.scss']
})
export class CallComponent implements OnInit {
	sessionId = '';
	tokens: TokenModel;
	joinSessionClicked: boolean = false;
	closeClicked: boolean = false;
	isSessionAlive: boolean = false;
	recordingEnabled: boolean = true;
	broadcastingEnabled: boolean = true;
	recordingList: RecordingInfo[] = [];
	recordingError: any;
	broadcastingError: BroadcastingError;
	serverError: string = '';
	loading: boolean = true;
	private isDebugSession: boolean = false;

	constructor(
		private restService: RestService,
		private participantService: ParticipantService,
		private recordingService: RecordingService,
		private broadcastingService: BroadcastingService,
		private router: Router,
		private route: ActivatedRoute
	) {}

	async ngOnInit() {
		this.route.params.subscribe((params: Params) => {
			this.sessionId = params.roomName;
		});

		// Just for debugging purposes
		const regex = /^UNSAFE_DEBUG_USE_CUSTOM_IDS_/gm;
		const match = regex.exec(this.sessionId);
		this.isDebugSession = match && match.length > 0;

		try {
			await this.initializeTokens();
		} catch (error) {
			console.error(error);
			this.serverError = error?.error?.message || error?.statusText;
		} finally {
			this.loading = false;
		}
	}

	async onNodeCrashed() {
		// Request the tokens again for reconnect to the session
		await this.initializeTokens();
	}
	onLeaveButtonClicked() {
		this.isSessionAlive = false;
		this.closeClicked = true;
		this.router.navigate([`/`]);
	}
	async onStartRecordingClicked() {
		try {
			await this.restService.startRecording(this.sessionId);
		} catch (error) {
			this.recordingError = error;
		}
	}

	async onStopRecordingClicked() {
		try {
			this.recordingList = await this.restService.stopRecording(this.sessionId);
		} catch (error) {
			this.recordingError = error;
		}
	}

	async onDeleteRecordingClicked(recordingId: string) {
		try {
			this.recordingList = await this.restService.deleteRecording(recordingId);
		} catch (error) {
			this.recordingError = error;
		}
	}

	async onStartBroadcastingClicked(broadcastingUrl: string) {
		try {
			this.broadcastingError = undefined;
			await this.restService.startBroadcasting(broadcastingUrl);
		} catch (error) {
			console.error(error);
			this.broadcastingError = error.error;
		}
	}

	async onStopBroadcastingClicked() {
		try {
			this.broadcastingError = undefined;
			await this.restService.stopBroadcasting();
		} catch (error) {
			console.error(error);
			this.broadcastingError = error.message || error;
		}
	}

	private async initializeTokens(): Promise<void> {
		let nickname: string = '';
		if (this.isDebugSession) {
			console.warn('DEBUGGING SESSION');
			nickname = this.participantService.getLocalParticipant().getNickname();
		}
		const { broadcastingEnabled, recordingEnabled, recordings, cameraToken, screenToken, isRecordingActive, isBroadcastingActive } =
			await this.restService.getTokens(this.sessionId, nickname);

		this.broadcastingEnabled = broadcastingEnabled;
		this.recordingEnabled = recordingEnabled;
		this.recordingList = recordings;
		this.tokens = {
			webcam: cameraToken,
			screen: screenToken
		};
		if (isRecordingActive) this.recordingService.updateStatus(RecordingStatus.STARTED);
		if (isBroadcastingActive) this.broadcastingService.updateStatus(BroadcastingStatus.STARTED);
	}
}
