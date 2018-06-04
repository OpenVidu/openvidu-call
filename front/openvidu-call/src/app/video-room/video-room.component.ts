import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { OpenVidu, Session, Stream, StreamEvent, Publisher, SignalOptions } from 'openvidu-browser';
import { OpenViduService } from '../shared/services/open-vidu.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserModel } from '../shared/models/user-model';
import { MatDialog } from '@angular/material';
import { DialogNicknameComponent } from '../shared/components/dialog-nickname/dialog-nickname.component';
import { StreamComponent } from '../shared/components/stream/stream.component';
import { OpenViduLayout } from '../shared/layout/openvidu-layout';
import { ChatComponent } from '../shared/components/chat/chat.component';
import { DialogExtensionComponent } from '../shared/components/dialog-extension/dialog-extension.component';

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.css'],
})
export class VideoRoomComponent implements OnInit, OnDestroy {
  localUser: UserModel = new UserModel();
  publisher: Publisher;
  remoteUsers: UserModel[] = [];
  resizeTimeout;
  @ViewChild('videoStream') private videoStream: StreamComponent;
  @ViewChild('chatNavbar') public chat: ChatComponent;

  // OpenVidu objects
  OV: OpenVidu;
  session: Session;

  // Streams to feed StreamComponent's
  localStream: Stream;

  // Join form
  mySessionId: string;
  myUserName: string;

  constructor(
    private openViduSrv: OpenViduService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) {}

  @HostListener('window:beforeunload')
  beforeunloadHandler() {
    this.leaveSession();
  }

  ngOnInit() {
    this.generateParticipantInfo();
    this.joinSession();
  }

  ngOnDestroy() {
    this.leaveSession();
  }

  toggleChat() {
    this.chat.toggle();
  }

  joinSession() {
    this.OV = new OpenVidu();
    this.session = this.OV.initSession();

    this.subscribeToUserChanged();
    this.subscribeToStreamCreated();
    this.subscribedToStreamDestroyed();
    this.connectToSession();
  }

  leaveSession() {
    if (this.session) {
      this.session.disconnect();
    }
    this.remoteUsers = [];
    this.localStream = null;
    this.session = null;
    this.OV = null;
    this.generateParticipantInfo();
    this.router.navigate(['']);
  }

  micStatusChanged(): void {
    this.localUser.setAudioMuted(!this.localUser.isAudioMuted());
    this.publisher.publishAudio(!this.localUser.isAudioMuted());
    this.sendSignalUserChanged({ isAudioMuted: this.localUser.isAudioMuted() });
  }

  camStatusChanged(): void {
    this.localUser.setVideoMuted(!this.localUser.isVideoMuted());
    this.publisher.publishVideo(!this.localUser.isVideoMuted());
    this.sendSignalUserChanged({ isVideoMuted: this.localUser.isVideoMuted() });
  }

  nicknameChanged(nickname: string): void {
    this.localUser.setNickname(nickname);
    this.sendSignalUserChanged({ nickname: this.localUser.getNickname() });
  }

  screenShareDisabled(): void {
    this.session.unpublish(this.publisher);
    this.connectWebCam();
  }

  openDialogNickname() {
    const dialogRef = this.dialog.open(DialogNicknameComponent, {
      width: '350px',
      data: { nickname: this.localUser.getNickname() },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.nicknameChanged(result);
      }
    });
  }
  openDialogExtension() {
    const dialogRef = this.dialog.open(DialogExtensionComponent, {
      width: '450px',
      data: { nickname: this.localUser.getNickname() },
    });
  }

  screenShare() {
    const publisher = this.OV.initPublisher(undefined, {
        videoSource: 'screen',
        publishAudio: !this.localUser.isAudioMuted(),
        publishVideo: !this.localUser.isVideoMuted()
      }, (error) => {
        if (error && error.name === 'SCREEN_EXTENSION_NOT_INSTALLED') {
          this.openDialogExtension();
        } else if (error && error.name === 'SCREEN_SHARING_NOT_SUPPORTED') {
          alert('Your browser does not support screen sharing');
        } else if (error && error.name === 'SCREEN_EXTENSION_DISABLED') {
          alert('You need to enable screen sharing extension');
        } else if (error && error.name === 'SCREEN_CAPTURE_DENIED') {
          alert('You need to choose a window or application to share');
        } else if (error === undefined) {
          this.session.unpublish(this.publisher);
          this.localUser.setScreenShared(true);
          this.publisher = publisher;
          this.localUser.setStream(publisher.stream);
          this.session.publish(this.publisher);
        }
      },
    );
  }

  private generateParticipantInfo() {
    // Random user nickname
    this.route.params.subscribe((params: Params) => {
      this.mySessionId = params.roomName;
      this.myUserName = 'OpenVidu_User' + Math.floor(Math.random() * 100);
    });
  }

  private deleteRemoteStream(stream: Stream): void {
    const userStream = this.remoteUsers.filter((user: UserModel) => user.stream === stream)[0];
    const index = this.remoteUsers.indexOf(userStream, 0);
    if (index > -1) {
      this.remoteUsers.splice(index, 1);
    }
  }

  private subscribeToUserChanged() {
    this.session.on('signal:userChanged', (event: any) => {
      this.remoteUsers.forEach((user: UserModel) => {
        if (user.getConnectionId() === event.from.connectionId) {
          const data = JSON.parse(event.data);
          if (data.isAudioMuted !== undefined) {
            user.setAudioMuted(data.isAudioMuted);
          }
          if (data.isVideoMuted !== undefined) {
            user.setVideoMuted(data.isVideoMuted);
          }
          if (data.nickname !== undefined) {
            user.setNickname(data.nickname);
          }
        }
      });
    });
  }

  private subscribeToStreamCreated() {
    this.session.on('streamCreated', (event: StreamEvent) => {
      const newUser = new UserModel();
      newUser.setStream(event.stream);
      newUser.setConnectionId(event.stream.connection.connectionId);
      newUser.setNickname(JSON.parse(event.stream.connection.data).clientData);
      newUser.setType('remote');
      this.remoteUsers.push(newUser);
      this.sendSignalUserChanged({
        isAudioMuted: this.localUser.isAudioMuted(),
        isVideoMuted: this.localUser.isVideoMuted(),
        nickname: this.localUser.getNickname(),
      });
      this.session.subscribe(event.stream, undefined);
    });
  }

  private subscribedToStreamDestroyed() {
    this.session.on('streamDestroyed', (event: StreamEvent) => {
      this.deleteRemoteStream(event.stream);
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.videoStream.openviduLayout.updateLayout();
      }, 20);
      event.preventDefault();
    });
  }

  private connectToSession(): void {
    this.openViduSrv.getToken(this.mySessionId).then((token) => {
      this.session
        .connect(token, { clientData: this.myUserName })
        .then(() => {
          this.connectWebCam();
        })
        .catch((error) => {
          console.log('There was an error connecting to the session:', error.code, error.message);
        });
    });
  }

  private connectWebCam(): void {
    this.publisher = this.OV.initPublisher(undefined, {
      audioSource: undefined,
      videoSource: undefined,
      publishAudio: !this.localUser.isAudioMuted(),
      publishVideo: !this.localUser.isVideoMuted(),
      resolution: '640x480',
      frameRate: 30,
      insertMode: 'APPEND',
      mirror: false,
    });
    this.localUser.setNickname(this.myUserName);
    this.localUser.setConnectionId(this.session.connection.connectionId);
    this.localUser.setStream(this.publisher.stream);
    this.localUser.setScreenShared(false);
    this.localStream = this.publisher.stream;
    this.session.publish(this.publisher);
  }

  private sendSignalUserChanged(data: any): void {
    const signalOptions: SignalOptions = {
      data: JSON.stringify(data),
      type: 'userChanged',
    };
    this.session.signal(signalOptions);
  }
}
