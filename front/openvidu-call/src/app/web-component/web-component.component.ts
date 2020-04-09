import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { VideoRoomComponent } from '../video-room/video-room.component';
import { OvSettings } from '../shared/types/ov-settings';
import { WebComponentModel } from '../shared/models/webcomponent-model';
import { LoggerService } from '../shared/services/logger/logger.service';
import { ILogger } from '../shared/types/logger-type';

@Component({
	selector: 'app-web-component',
	template: `
		<app-video-room
			#videoRoom
			*ngIf="display"
			[externalConfig]="webComponent"
			(leaveSession)="emitLeaveSessionEvent($event)"
			(joinSession)="emitJoinSessionEvent($event)"
			(error)="emitErrorEvent($event)"
		>
		</app-video-room>
	`,
	styleUrls: ['./web-component.component.css']
})
export class WebComponentComponent {
	@Input() ovSettings: OvSettings;
	@Output() joinSession = new EventEmitter<any>();
	@Output() leaveSession = new EventEmitter<any>();
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
			this.webComponent.setSessionConfig(config);
			if (this.webComponent.canJoinToSession()) {
				this.display = true;
				return;
			}
			this.log.e('Parameters received are incorrect. Exit session');
			this.videoRoom?.exitSession();
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

	emitJoinSessionEvent(event): void {
		this.joinSession.emit(event);
		this.videoRoom.checkSizeComponent();
	}

	emitLeaveSessionEvent(event): void {
		this.leaveSession.emit(event);
		this.display = false;
	}

	emitErrorEvent(event): void {
		setTimeout(() => this.error.emit(event), 20);
	}
}
