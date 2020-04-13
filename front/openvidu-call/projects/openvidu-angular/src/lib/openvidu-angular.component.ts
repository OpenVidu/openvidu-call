import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { VideoRoomComponent } from './video-room/video-room.component';
import { Session, ConnectionEvent, Publisher } from 'openvidu-browser';
import { UserModel } from './shared/models/user-model';
import { AngularLibraryModel } from './shared/models/angular-library';
import { OpenViduLayout, OpenViduLayoutOptions } from './shared/layout/openvidu-layout';
import { OvSettings } from './shared/types/ov-settings';

@Component({
	selector: 'opv-session',
	template: `
		<app-video-room
			#videoRoom
			*ngIf="display"
			[externalConfig]="angularLibrary"
			(_session)="emitSession($event)"
			(_publisher)="emitPublisher($event)"
			(_error)="emitErrorEvent($event)"
		>
		</app-video-room>
	`,
	styles: []
})
export class OpenviduSessionComponent implements OnInit {
	angularLibrary: AngularLibraryModel;
	display = false;

	@Input()
	ovSettings: OvSettings;
	@Input()
	sessionName: string;
	@Input()
	user: string;
	@Input()
	openviduServerUrl: string;
	@Input()
	openviduSecret: string;
	@Input()
	tokens: string[];
	@Input()
	theme: string;
	@Output() sessionCreated = new EventEmitter<any>();
	@Output() publisherCreated = new EventEmitter<any>();
	@Output() error = new EventEmitter<any>();

	@ViewChild('videoRoom')
	public videoRoom: VideoRoomComponent;

	constructor() {}

	ngOnInit() {
		this.angularLibrary = new AngularLibraryModel();
		this.angularLibrary.setOvSettings(this.ovSettings);
		this.angularLibrary.setSessionName(this.sessionName);
		this.angularLibrary.setOvServerUrl(this.openviduServerUrl);
		this.angularLibrary.setOvSecret(this.openviduSecret);
		this.angularLibrary.setTheme(this.theme);
		this.angularLibrary.setNickname(this.user);
		this.angularLibrary.setTokens(this.tokens);
		if (this.angularLibrary.canJoinToSession()) {
			this.display = true;
		}
	}

	emitSession(session: Session) {
		session.on('sessionDisconnected', (e) => this.display = false);
		session.on('connectionCreated', (e: ConnectionEvent) => {
			setTimeout(() => {
				if (!e.connection.stream.streamManager.remote) {
					this.videoRoom.checkSizeComponent();
				}
			}, 700);
		});
		this.sessionCreated.emit(session);
	}
	emitPublisher(publisher: Publisher) {
		// publisher.on('streamPlaying', () => this.videoRoom.checkSizeComponent());
		this.publisherCreated.emit(publisher);
	}

	emitErrorEvent(event) {
		setTimeout(() => this.error.emit(event), 20);
	}

	getLocalUsers(): UserModel[] {
		return this.videoRoom.localUsers;
	}

	getOpenviduLayout(): OpenViduLayout {
		return this.videoRoom.openviduLayout;
	}

	getOpenviduLayoutOptions(): OpenViduLayoutOptions {
		return this.videoRoom.openviduLayoutOptions;
	}
}
