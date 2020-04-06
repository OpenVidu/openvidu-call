import { Component, OnInit, Input, EventEmitter, Output, HostListener } from '@angular/core';
import { UtilsService } from '../../services/utils/utils.service';
import { OvSettings } from '../../types/ov-settings';
import { VideoFullscreenIcon } from '../../types/icon-type';

@Component({
	selector: 'app-toolbar',
	templateUrl: './toolbar.component.html',
	styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

	@Input() lightTheme: boolean;
	@Input() mySessionId: boolean;
	@Input() compact: boolean;
	@Input() showNotification: boolean;
	@Input() newMessagesNum: number;
	@Input() ovSettings: OvSettings;

	@Input() isWebcamVideoEnabled: boolean;
	@Input() isWebcamAudioEnabled: boolean;
	@Input() isScreenEnabled: boolean;
	@Input() isAutoLayout: boolean;
	@Input() isConnectionLost: boolean;
	@Input() hasVideoDevices: boolean;
	@Output() micButtonClicked = new EventEmitter<any>();
	@Output() camButtonClicked = new EventEmitter<any>();
	@Output() screenShareClicked = new EventEmitter<any>();
	@Output() layoutButtonClicked = new EventEmitter<any>();
	@Output() exitButtonClicked = new EventEmitter<any>();
	@Output() chatButtonClicked = new EventEmitter<any>();

	fullscreenIcon = VideoFullscreenIcon.BIG;

	constructor(private utilsSrv: UtilsService) {}

	@HostListener('window:resize', ['$event'])
	sizeChange(event) {
		const maxHeight = window.screen.height;
		const maxWidth = window.screen.width;
		const curHeight = window.innerHeight;
		const curWidth = window.innerWidth;
		if (maxWidth !== curWidth && maxHeight !== curHeight) {
			this.fullscreenIcon = VideoFullscreenIcon.BIG;
		}
	}

	ngOnInit() {}

	toggleMicrophone() {
		this.micButtonClicked.emit();
	}

	toggleCamera() {
		this.camButtonClicked.emit();
	}

	toggleScreenShare() {
		this.screenShareClicked.emit();
	}

	toggleSpeakerLayout() {
		this.layoutButtonClicked.emit();
	}

	exitSession() {
		this.exitButtonClicked.emit();
	}

	toggleChat() {
		this.chatButtonClicked.emit();
	}

	toggleFullscreen() {
		this.utilsSrv.toggleFullscreen('videoRoomNavBar');
		this.fullscreenIcon = this.fullscreenIcon === VideoFullscreenIcon.BIG ? VideoFullscreenIcon.NORMAL : VideoFullscreenIcon.BIG;
	}
}
