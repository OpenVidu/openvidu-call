import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { VideoRoomComponent } from '../video-room/video-room.component';
import { ISessionCongif } from '../shared/models/webcomponent-config';

@Component({
  selector: 'app-web-component',
  templateUrl: './web-component.component.html',
  styleUrls: ['./web-component.component.css'],
})
export class WebComponentComponent implements OnInit {
  _sessionId: string;
  _user: string;
  _token: string;
  @Input('openviduServerUrl') openviduServerUrl: string;
  @Input('openviduSecret') openviduSecret: string;
  @Output('joinSession') joinSession = new EventEmitter<any>();
  @Output('leaveSession') leaveSession = new EventEmitter<any>();

  @ViewChild('videoRoom') videoRoom: VideoRoomComponent;

  display = false;

  constructor() {}

  @Input('sessionConfig')
  set sessionConfig(sessionConfig: ISessionCongif) {
    console.log('Session config input ', sessionConfig);
    this._sessionId = sessionConfig.sessionId;
    this._user = sessionConfig.user;
    this._token = sessionConfig.token;
    if (this.validateParameters()) {
      this.display = true;
    }
  }

  ngOnInit() {}

  validateParameters(): boolean {
    if ((this._sessionId && this.openviduServerUrl && this.openviduSecret && this._user) || (this._token && this._user)) {
      return true;
    }
    return false;
  }

  emitJoinSessionEvent(event) {
    this.joinSession.emit(event);
    console.log('event Join session');
  }

  emitLeaveSessionEvent(event) {
    this.leaveSession.emit();
    this.display = false;
  }
}
