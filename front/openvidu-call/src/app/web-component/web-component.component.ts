import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { VideoRoomComponent } from '../video-room/video-room.component';
import { ISessionCongif } from '../shared/models/webcomponent-config';

@Component({
  selector: 'app-web-component',
  templateUrl: './web-component.component.html',
  styleUrls: ['./web-component.component.css'],
})
export class WebComponentComponent implements OnInit {
  _sessionName: string;
  _user: string;
  _token: string;
  @Input('openviduServerUrl') openviduServerUrl: string;
  @Input('openviduSecret') openviduSecret: string;
  @Input('theme') theme: string;
  @Output('joinSession') joinSession = new EventEmitter<any>();
  @Output('leaveSession') leaveSession = new EventEmitter<any>();
  @Output('error') error = new EventEmitter<any>();

  @ViewChild('videoRoom') videoRoom: VideoRoomComponent;

  public display = false;

  constructor() {}

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
      this._token = sessionConfig.token;
      if (this.validateParameters()) {
        this.display = true;
      }
    } else {
      this.videoRoom.exitSession();
    }
  }

  ngOnInit() {}

  validateParameters(): boolean {
    if ((this._sessionName && this.openviduServerUrl && this.openviduSecret && this._user) || (this._token && this._user)) {
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
}
