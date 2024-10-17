import { Component } from '@angular/core';
import { DynamicGridComponent, HttpService, ToggleCardComponent } from 'shared-call-components';

@Component({
	selector: 'ov-room-config',
	standalone: true,
	imports: [DynamicGridComponent, ToggleCardComponent],
	templateUrl: './room-config.component.html',
	styleUrl: './room-config.component.scss'
})
export class RoomConfigComponent {
	recordingEnabled = false;
	broadcastingEnabled = false;
	chatEnabled = false;

	constructor(private httpService: HttpService) {}

	async onRecordingToggle(checked: boolean) {
		this.recordingEnabled = checked;
		console.log('Recording toggled', this.recordingEnabled);

		try {
			await this.httpService.saveGlobalPreferences({ recordingEnabled: this.recordingEnabled });
			// TODO: Show a toast message
		} catch (error) {
			console.error('Error saving recording preferences', error);
			// TODO: Show a toast message
			this.recordingEnabled = !this.recordingEnabled;
		}
	}

	async onBroadcastingToggle(checked: boolean) {
		this.broadcastingEnabled = checked;
		console.log('Broadcasting toggled', this.broadcastingEnabled);

		try {
			await this.httpService.saveGlobalPreferences({ broadcastingEnabled: this.broadcastingEnabled });
			// TODO: Show a toast message
		} catch (error) {
			console.error('Error saving broadcasting preferences', error);
			// TODO: Show a toast message
			this.broadcastingEnabled = !this.broadcastingEnabled;
		}
	}

	async onChatToggle(checked: boolean) {
		this.chatEnabled = checked;
		console.log('Chat toggled', this.chatEnabled);

		try {
			await this.httpService.saveGlobalPreferences({ chatEnabled: this.chatEnabled });
			// TODO: Show a toast message
		} catch (error) {
			console.error('Error saving chat preferences', error);
			// TODO: Show a toast message
			this.chatEnabled = !this.chatEnabled;
		}
	}
}
