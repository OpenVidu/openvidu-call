import { Component, OnInit } from '@angular/core';
import { RoomService, NotificationService } from '../../../services';
import { DynamicGridComponent, ToggleCardComponent } from '../../../components';
import { RoomPreferences } from '@typings-ce';
import { ILogger, LoggerService, Room } from 'openvidu-components-angular';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListItem, MatListModule } from '@angular/material/list';
import { OpenViduMeetRoom } from '@lib/typings/ce/room';

@Component({
	selector: 'ov-room-preferences',
	standalone: true,
	imports: [
		DynamicGridComponent,
		ToggleCardComponent,
		MatListModule,
		MatCardModule,
		DatePipe,
		MatButtonModule,
		MatIconModule
	],
	templateUrl: './room-preferences.component.html',
	styleUrl: './room-preferences.component.scss'
})
export class RoomPreferencesComponent implements OnInit {
	createdRooms: OpenViduMeetRoom[] = [];
	private roomPreferences!: RoomPreferences;
	recordingEnabled = false;
	broadcastingEnabled = false;
	chatEnabled = false;
	backgroundsEnabled = false;

	protected log;

	constructor(
		protected loggerService: LoggerService,

		private roomService: RoomService,
		private notificationService: NotificationService
	) {
		this.log = this.loggerService.get('OpenVidu Meet - RoomService');
	}

	async ngOnInit() {
		try {
			const [rooms] = await Promise.all([this.roomService.listRooms(), this.loadRoomPreferences()]);
			console.log('Rooms:', rooms);
			this.createdRooms = rooms;
		} catch (error) {
			console.error('Error fetching room preferences', error);
		}
	}

	async createRoom() {
		try {
			const room = await this.roomService.createRoom();
			this.notificationService.showSnackbar('Room created');
			this.log.d('Room created:', room);
			this.createdRooms.push(room);
		} catch (error) {
			this.notificationService.showAlert('Error creating room');
			this.log.e('Error creating room:', error);
		}
	}

	openRoom(roomName: string) {
		window.open(`/${roomName}`, '_blank');
	}

	deleteRoom(room: OpenViduMeetRoom) {
		try {
			this.roomService.deleteRoom(room.roomName);
			this.createdRooms = this.createdRooms.filter((r) => r.roomName !== room.roomName);
			this.notificationService.showSnackbar('Room deleted');

		} catch (error) {
			this.notificationService.showAlert('Error deleting room');
			this.log.e('Error deleting room:', error);
		}
	}

	onRoomClicked(room: OpenViduMeetRoom) {
		console.log('Room clicked:', room);
	}

	async onRecordingToggle(enabled: boolean) {
		console.log('Recording toggled', enabled);

		try {
			this.roomPreferences.recordingPreferences.enabled = enabled;
			await this.roomService.saveRoomPreferences(this.roomPreferences);
			this.recordingEnabled = enabled;

			// TODO: Show a toast message
		} catch (error) {
			console.error('Error saving recording preferences', error);
			// TODO: Show a toast message
		}
	}

	async onBroadcastingToggle(enabled: boolean) {
		console.log('Broadcasting toggled', enabled);

		try {
			this.roomPreferences.broadcastingPreferences.enabled = enabled;
			await this.roomService.saveRoomPreferences(this.roomPreferences);
			this.broadcastingEnabled = enabled;
			// TODO: Show a toast message
		} catch (error) {
			console.error('Error saving broadcasting preferences', error);
			// TODO: Show a toast message
		}
	}

	async onChatToggle(enabled: boolean) {
		console.log('Chat toggled', enabled);

		try {
			this.roomPreferences.chatPreferences.enabled = enabled;
			await this.roomService.saveRoomPreferences(this.roomPreferences);
			this.chatEnabled = enabled;
			// TODO: Show a toast message
		} catch (error) {
			console.error('Error saving chat preferences', error);
			// TODO: Show a toast message
		}
	}

	async onVirtualBackgroundToggle(enabled: boolean) {
		console.log('Virtual background toggled', enabled);

		try {
			this.roomPreferences.virtualBackgroundPreferences.enabled = enabled;
			await this.roomService.saveRoomPreferences(this.roomPreferences);
			this.backgroundsEnabled = enabled;
			// TODO: Show a toast message
		} catch (error) {
			console.error('Error saving virtual background preferences', error);
			// TODO: Show a toast message
		}
	}

	/**
	 * Loads the room preferences from the global preferences service and assigns them to the component's properties.
	 *
	 * @returns {Promise<void>} A promise that resolves when the room preferences have been loaded and assigned.
	 */
	private async loadRoomPreferences() {
		const preferences = await this.roomService.getRoomPreferences();
		this.roomPreferences = preferences;

		console.log('Room preferences:', preferences);

		// Destructures the `preferences` object to extract the enabled status of various features.
		const {
			recordingPreferences: { enabled: recordingEnabled },
			broadcastingPreferences: { enabled: broadcastingEnabled },
			chatPreferences: { enabled: chatEnabled },
			virtualBackgroundPreferences: { enabled: backgroundsEnabled }
		} = preferences;

		// Assigns the extracted values to the component's properties.
		Object.assign(this, { recordingEnabled, broadcastingEnabled, chatEnabled, backgroundsEnabled });
	}
}
