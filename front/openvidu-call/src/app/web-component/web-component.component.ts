import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ISessionCongif } from '../shared/models/webcomponent-config';
import { VideoRoomComponent } from '../video-room/video-room.component';
import { OvSettings } from '../shared/models/ov-settings';

@Component({
  selector: 'app-web-component',
  template: `
    <app-video-room
      #videoRoom
      *ngIf="display"
      [theme]="theme"
      [sessionName]="_sessionName"
      [user]="_user"
      [openviduServerUrl]="openviduServerUrl"
      [openviduSecret]="openviduSecret"
      [tokens]="_tokens"
      [ovSettings]="ovSettings"
      [isWebComponent]="true"
      (leaveSession)="emitLeaveSessionEvent($event)"
      (joinSession)="emitJoinSessionEvent($event)"
      (error)="emitErrorEvent($event)"
    >
    </app-video-room>
  `,
  styleUrls: ['./web-component.component.css'],
})
export class WebComponentComponent implements OnInit {
  _sessionName: string;
  _user: string;
  _tokens: string[];

  @Input() openviduServerUrl: string;
  @Input() openviduSecret: string;
  @Input() theme: string;
  @Input() ovSettings: OvSettings;
  @Output() joinSession = new EventEmitter<any>();
  @Output() leaveSession = new EventEmitter<any>();
  @Output() error = new EventEmitter<any>();

  @ViewChild('videoRoom', {static: false}) videoRoom: VideoRoomComponent;

  public display = false;

  constructor() {
    this.ovSettings = {
      chat: true,
      autopublish: false,
      toolbarButtons: {
        video: true,
        audio: true,
        fullscreen: true,
        screenShare: true,
        exit: true,
      },
    };
  }

  @Input('sessionConfig')
  set sessionConfig(config: any) {
    let sessionConfig: ISessionCongif;
    console.log('Session config input ', config);
    sessionConfig = config;
    if (typeof config === 'string') {
      sessionConfig = JSON.parse(config);
    }
    if (sessionConfig) {
      this._sessionName = sessionConfig.sessionName;
      this._user = sessionConfig.user;
      this._tokens = sessionConfig.tokens;
      if (sessionConfig.ovSettings && this.isOvSettingsType(sessionConfig.ovSettings)) {
        this.ovSettings = sessionConfig.ovSettings;
      }
      if (this.validateParameters()) {
        this.display = true;
      }
    } else {
      this.videoRoom.exitSession();
    }
  }

  ngOnInit() {}

  validateParameters(): boolean {
    console.log("TOKENS", this._tokens);
    if ((this._sessionName && this.openviduServerUrl && this.openviduSecret && this._user) || (this._tokens.length > 0 && this._user)) {
      if (this._tokens.length === 1) {
        this.ovSettings.toolbarButtons.screenShare = false;
        console.warn('Screen share funcionality has been disabled. OpenVidu Angular has received only one token.');
      }
      return true;
    }
    return false;
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

  private isOvSettingsType(obj) {
    return 'chat' in obj && typeof obj['chat'] === 'boolean' &&
    'autopublish' in obj && typeof obj['autopublish'] === 'boolean' &&
    'toolbarButtons' in obj && typeof obj['toolbarButtons'] === 'object' &&
    'audio' in obj.toolbarButtons && typeof obj.toolbarButtons['audio'] === 'boolean' &&
    'audio' in obj.toolbarButtons && typeof obj.toolbarButtons['audio'] === 'boolean' &&
    'video' in obj.toolbarButtons && typeof obj.toolbarButtons['video'] === 'boolean' &&
    'screenShare' in obj.toolbarButtons && typeof obj.toolbarButtons['screenShare'] === 'boolean' &&
    'fullscreen' in obj.toolbarButtons && typeof obj.toolbarButtons['fullscreen'] === 'boolean' &&
    'exit' in obj.toolbarButtons && typeof obj.toolbarButtons['exit'] === 'boolean';
  }
}
