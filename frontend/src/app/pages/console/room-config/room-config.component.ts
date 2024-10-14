import { Component } from '@angular/core';
import { DynamicGridComponent, ToggleCardComponent } from 'shared-call-components';

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
	onRecordingToggle(checked: boolean) {
		this.recordingEnabled = checked;
		console.log('Recording toggled', this.recordingEnabled);
	}

  onBroadcastingToggle(checked: boolean) {
    this.broadcastingEnabled = checked;
    console.log('Broadcasting toggled', this.broadcastingEnabled);
  }

  onChatToggle(checked: boolean) {
    this.chatEnabled = checked;
    console.log('Chat toggled', this.chatEnabled);
  }
}
