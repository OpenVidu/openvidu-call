import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { VideoRoomComponent } from '../video-room/video-room.component';
import { OvSettings } from '../shared/types/ov-settings';
import { WebComponentModel } from '../shared/models/webcomponent-model';
import { LoggerService } from '../shared/services/logger/logger.service';
import { ILogger } from '../shared/types/logger-type';
import { ConnectionEvent, Session, Publisher } from 'openvidu-browser';

@Component({
	selector: 'app-web-component',
	template: `
		<app-video-room
			#videoRoom
			*ngIf="display"
			[externalConfig]="webComponent"
			(_error)="emitErrorEvent($event)"
			(_session)="emitSession($event)"
			(_publisher)="emitPublisher($event)"
		>
		</app-video-room>
	`,
	styleUrls: ['./web-component.component.css']
})
export class WebComponentComponent {

	@Input() ovSettings: OvSettings;
	@Output() sessionCreated = new EventEmitter<any>();
	@Output() publisherCreated = new EventEmitter<any>();
	@Output() error = new EventEmitter<any>();
	@ViewChild('videoRoom') videoRoom: VideoRoomComponent;

	display = false;
	wc_sessionName: string;
	wc_username: string;
	wc_tokens: string[];

	webComponent: WebComponentModel = new WebComponentModel();

	private log: ILogger;

	constructor(private loggerSrv: LoggerService) {
		this.log = this.loggerSrv.get('WebComponentComponent');
	}

	@Input('sessionConfig')
	set sessionConfig(config: any) {
		this.log.d('Webcomponent sessionConfig: ', config);
		setTimeout(() => {
			// Leave session when sessionConfig is undefined
			if (this.isEmpty(config)) {
				this.log.w('Parameters received are incorrect.', config);
				this.log.w('Exit session');
				this.videoRoom?.exitSession();
				return;
			}

			this.webComponent.setSessionConfig(config);
			this.display = this.webComponent.canJoinToSession();

		}, 200);
	}

	@Input()
	set theme(theme: string) {
		this.webComponent.setTheme(theme);
	}

	@Input()
	set openviduServerUrl(url: string) {
		this.webComponent.setOvServerUrl(url);
	}

	@Input()
	set openviduSecret(secret: string) {
		this.webComponent.setOvSecret(secret);
	}

	emitErrorEvent(event) {
		setTimeout(() => this.error.emit(event), 20);
	}

	emitSession(session: Session) {
		session.on('sessionDisconnected', (e) => this.display = false);
		this.sessionCreated.emit(session);
	}
	emitPublisher(publisher: Publisher) {
		publisher.on('streamPlaying', () => this.videoRoom.checkSizeComponent());
		this.publisherCreated.emit(publisher);
	}

	private isEmpty(obj: any): boolean {
		return Object.keys(obj).length === 0;
	}
}
