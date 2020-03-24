import { Component, OnInit, Input, EventEmitter, Output, HostListener } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { UtilsService } from '../../services/utils/utils.service';
import { OvSettings } from '../../models/ov-settings';

@Component({
	selector: 'app-toolbar',
	templateUrl: './toolbar.component.html',
	styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
	fullscreenIcon = 'fullscreen';

	@Input() lightTheme: boolean;
	@Input() mySessionId: boolean;
	@Input() compact: boolean;
	@Input() showNotification: boolean;
	@Input() newMessagesNum: number;
	@Input() ovSettings: OvSettings;

	@Input() isWebcamVideoEnabled: boolean;
	@Input() isWebcamAudioEnabled: boolean;
	@Input() isScreenEnabled: boolean;


	@Output() micButtonClicked = new EventEmitter<any>();
	@Output() camButtonClicked = new EventEmitter<any>();
	@Output() screenShareClicked = new EventEmitter<any>();
	@Output() exitButtonClicked = new EventEmitter<any>();
	@Output() chatButtonClicked = new EventEmitter<any>();

	constructor(private utilsSrv: UtilsService) {}

	@HostListener('window:resize', ['$event'])
	sizeChange(event) {
		const maxHeight = window.screen.height;
		const maxWidth = window.screen.width;
		const curHeight = window.innerHeight;
		const curWidth = window.innerWidth;
		if (maxWidth !== curWidth && maxHeight !== curHeight) {
			this.fullscreenIcon = 'fullscreen';
		}
	}

	ngOnInit() {}

	micStatusChanged() {
		this.micButtonClicked.emit();
	}

	camStatusChanged() {
		this.camButtonClicked.emit();
	}

	toggleScreenShare() {
		this.screenShareClicked.emit();
	}

	exitSession() {
		this.exitButtonClicked.emit();
	}

	toggleChat() {
		this.chatButtonClicked.emit();
	}

	toggleFullscreen() {
		const state = this.utilsSrv.toggleFullscreen('videoRoomNavBar');
		if (state === 'fullscreen') {
			this.fullscreenIcon = 'fullscreen_exit';
		} else {
			this.fullscreenIcon = 'fullscreen';
		}
	}
}
