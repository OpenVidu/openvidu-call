import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import {
	BroadcastingStartRequestedEvent,
	BroadcastingStopRequestedEvent,
	RecordingDeleteRequestedEvent,
	RecordingStartRequestedEvent,
	RecordingStopRequestedEvent,
	OpenViduComponentsModule,
	ApiDirectiveModule
} from 'openvidu-components-angular';

import {
	BroadcastingPreferences,
	ChatPreferences,
	RecordingPreferences,
	VirtualBackgroundPreferences
} from '@typings-ce';
import { HttpService, ContextService, GlobalPreferencesService } from '../../services';

@Component({
	selector: 'app-video-room',
	templateUrl: './video-room.component.html',
	styleUrls: ['./video-room.component.scss'],
	standalone: true,
	imports: [OpenViduComponentsModule, ApiDirectiveModule, MatIcon]
})
export class VideoRoomComponent implements OnInit {
	roomName = '';
	participantName = '';
	token = '';
	serverError = '';
	loading = true;
	chatPreferences: ChatPreferences = { enabled: true };
	recordingPreferences: RecordingPreferences = { enabled: true };
	broadcastingPreferences: BroadcastingPreferences = { enabled: true };
	virtualBackgroundPreferences: VirtualBackgroundPreferences = { enabled: true };

	featureFlags = {
		showActivityPanel: true,
		showPrejoin: true,
		showChat: true,
		showRecording: true,
		showBroadcasting: true,
		showBackgrounds: true
	};

	constructor(
		protected httpService: HttpService,
		protected router: Router,
		protected contextService: ContextService,
		protected globalPreferencesService: GlobalPreferencesService,
		protected cdr: ChangeDetectorRef
	) {}

	async ngOnInit() {
		try {
			await this.loadRoomPreferences();

			this.roomName = this.contextService.getRoomName();
			this.participantName = this.contextService.getParticipantName();

			const needToConfigureFlagsFromToken =
				this.contextService.isStandaloneModeWithToken() || this.contextService.isEmbeddedMode();

			if (needToConfigureFlagsFromToken) {
				this.configureFetureFlagsFromTokenPermissions();
			}
		} catch (error: any) {
			console.error('Error fetching room preferences', error);
			this.serverError = error.error.message || error.message || error.error;
		}
		this.loading = false;
	}

	async onTokenRequested(participantName: string) {
		try {
			if (this.contextService.isStandaloneMode()) {
				// As token is not provided, we need to set the participant name from
				// ov-videoconference event
				this.contextService.setParticipantName(participantName);
			}

			this.token = await this.contextService.getToken();
		} catch (error: any) {
			console.error(error);
			this.serverError = error.error;
		}

		this.loading = false;
		this.cdr.detectChanges();
	}

	onParticipantLeft() {
		console.warn('Participant left the room. Redirecting to:');

		if (this.contextService.isEmbeddedMode()) {
			const redirectURL = this.contextService.getRedirectURL();
			if (redirectURL) {
				// Check if the redirect URL is an external URL
				const isExternalURL = /^https?:\/\//.test(redirectURL);

				if (isExternalURL) {
					console.log('Redirecting to external URL:', redirectURL);
					window.location.href = redirectURL;
				} else {
					console.log('Participant left the room. Redirecting to internal route:', redirectURL);
					this.router.navigate([redirectURL], { replaceUrl: true });
				}
			} else {
				console.warn('Participant left the room. Redirecting to:', `/`);
				this.router.navigate([`/`]);
			}
			return;
		}

		this.router.navigate([`/`]);
	}

	async onRecordingStartRequested(event: RecordingStartRequestedEvent) {
		try {
			const { roomName } = event;
			await this.httpService.startRecording(roomName);
		} catch (error) {
			console.error(error);
		}
	}

	async onRecordingStopRequested(event: RecordingStopRequestedEvent) {
		try {
			const { recordingId } = event;

			if (!recordingId) throw new Error('Recording ID not found when stopping recording');

			await this.httpService.stopRecording(recordingId);
		} catch (error) {
			console.error(error);
		}
	}

	async onRecordingDeleteRequested(event: RecordingDeleteRequestedEvent) {
		try {
			const { recordingId } = event;

			if (!recordingId) throw new Error('Recording ID not found when deleting recording');

			await this.httpService.deleteRecording(recordingId);
		} catch (error) {
			console.error(error);
		}
	}

	async onBroadcastingStartRequested(event: BroadcastingStartRequestedEvent) {
		try {
			const { roomName, broadcastUrl } = event;
			await this.httpService.startBroadcasting(roomName, broadcastUrl);
		} catch (error) {
			console.error(error);
		}
	}

	async onBroadcastingStopRequested(event: BroadcastingStopRequestedEvent) {
		try {
			const { broadcastingId } = event;
			await this.httpService.stopBroadcasting(broadcastingId);
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * Loads the room preferences from the global preferences service and assigns them to the component.
	 *
	 * This method fetches the room preferences asynchronously and updates the component's properties
	 * based on the fetched preferences. It also updates the UI flags to show or hide certain features
	 * like chat, recording, and activity panel based on the preferences.
	 *
	 * @returns {Promise<void>} A promise that resolves when the room preferences have been loaded and applied.
	 */
	private async loadRoomPreferences() {
		const preferences = await this.globalPreferencesService.getRoomPreferences();
		// Assign the preferences to the component
		Object.assign(this, preferences);

		this.featureFlags.showChat = this.chatPreferences.enabled;
		this.featureFlags.showRecording = this.recordingPreferences.enabled;
		this.featureFlags.showBroadcasting = this.broadcastingPreferences.enabled;
		this.featureFlags.showActivityPanel = this.recordingPreferences.enabled || this.broadcastingPreferences.enabled;
		this.featureFlags.showBackgrounds = this.virtualBackgroundPreferences.enabled;
	}

	/**
	 * Configures the feature flags based on the token permissions.
	 *
	 * This method checks the token permissions and sets the feature flags accordingly.
	 * @private
	 */
	private configureFetureFlagsFromTokenPermissions() {
		if (this.featureFlags.showChat) {
			this.featureFlags.showChat = this.contextService.canChat();
		}

		if (this.featureFlags.showRecording) {
			this.featureFlags.showRecording = this.contextService.canRecord();
		}

		this.featureFlags.showPrejoin = false;
	}
}
