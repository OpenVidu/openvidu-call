import { Component, OnInit, OnDestroy, HostListener, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { OpenVidu, Session, Stream, StreamEvent, Publisher, SignalOptions, StreamManagerEvent } from 'openvidu-browser';
import { OpenViduService } from '../shared/services/open-vidu.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserModel } from '../shared/models/user-model';
import { MatDialog } from '@angular/material';
import { DialogNicknameComponent } from '../shared/components/dialog-nickname/dialog-nickname.component';
import { ChatComponent } from '../shared/components/chat/chat.component';
import { DialogExtensionComponent } from '../shared/components/dialog-extension/dialog-extension.component';
import { OpenViduLayout } from '../shared/layout/openvidu-layout';
import { DialogErrorComponent } from '../shared/components/dialog-error/dialog-error.component';

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.css'],
})
export class VideoRoomComponent implements OnInit, OnDestroy {
  localUser: UserModel;
  remoteUsers: UserModel[] = [];
  resizeTimeout;

  // webComponent's inputs and outputs
  @Input('sessionId') sessionId: string;
  @Input('user') user: string;
  @Input('openviduServerUrl') openviduServerUrl: string;
  @Input('openviduSecret') openviduSecret: string;
  @Input('token') token: string;
  @Output('joinSession') joinSession = new EventEmitter<any>();
  @Output('leaveSession') leaveSession = new EventEmitter<any>();

  @ViewChild('chatNavbar') public chat: ChatComponent;

  OV: OpenVidu;
  session: Session;
  openviduLayout: OpenViduLayout;

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
    this.exitSession();
  }

  @HostListener('window:resize', ['$event'])
  sizeChange(event) {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.openviduLayout.updateLayout();
    }, 20);
  }

  ngOnInit() {
    this.generateParticipantInfo();
    this.joinToSession();

    this.openviduLayout = new OpenViduLayout();
    this.openviduLayout.initLayoutContainer(document.getElementById('layout'), {
      maxRatio: 3 / 2, // The narrowest ratio that will be used (default 2x3)
      minRatio: 9 / 16, // The widest ratio that will be used (default 16x9)
      fixedRatio: false /* If this is true then the aspect ratio of the video is maintained
      and minRatio and maxRatio are ignored (default false) */,
      bigClass: 'OV_big', // The class to add to elements that should be sized bigger
      bigPercentage: 0.8, // The maximum percentage of space the big ones should take up
      bigFixedRatio: false, // fixedRatio for the big ones
      bigMaxRatio: 3 / 2, // The narrowest ratio to use for the big elements (default 2x3)
      bigMinRatio: 9 / 16, // The widest ratio to use for the big elements (default 16x9)
      bigFirst: true, // Whether to place the big one in the top left (true) or bottom right
      animate: true, // Whether you want to animate the transitions
    });
  }

  ngOnDestroy() {
    this.exitSession();
  }

  toggleChat() {
    this.chat.toggle();
  }

  joinToSession() {
    this.OV = new OpenVidu();
    this.session = this.OV.initSession();
    this.localUser = new UserModel();

    this.subscribeToUserChanged();
    this.subscribeToStreamCreated();
    this.subscribedToStreamDestroyed();
    this.connectToSession();
  }

  exitSession() {
    if (this.session) {
      this.session.disconnect();
    }
    this.remoteUsers = [];
    this.session = null;
    this.localUser = null;
    this.OV = null;
    this.openviduLayout = null;
    // this.generateParticipantInfo();
    this.router.navigate(['']);
    this.leaveSession.emit();
  }

  micStatusChanged(): void {
    this.localUser.setAudioMuted(!this.localUser.isAudioMuted());
    (<Publisher>this.localUser.streamManager).publishAudio(!this.localUser.isAudioMuted());
    this.sendSignalUserChanged({ isAudioMuted: this.localUser.isAudioMuted() });
  }

  camStatusChanged(): void {
    this.localUser.setVideoMuted(!this.localUser.isVideoMuted());
    (<Publisher>this.localUser.streamManager).publishVideo(!this.localUser.isVideoMuted());
    this.sendSignalUserChanged({ isVideoMuted: this.localUser.isVideoMuted() });
  }

  nicknameChanged(nickname: string): void {
    this.localUser.setNickname(nickname);
    this.sendSignalUserChanged({ nickname: this.localUser.getNickname() });
  }

  screenShareDisabled(): void {
    this.session.unpublish(<Publisher>this.localUser.streamManager);
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
    this.dialog.open(DialogExtensionComponent, {
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
          this.session.unpublish(<Publisher>this.localUser.streamManager);
          this.localUser.setScreenShared(true);
          this.localUser.setStreamManager(publisher);
          this.session.publish(<Publisher>this.localUser.streamManager);
        }
      },
    );
    publisher.on('streamPlaying', () => {
      this.openviduLayout.updateLayout();
      (<HTMLElement>publisher.videos[0].video).parentElement.classList.remove('custom-class');
    });
  }

  private generateParticipantInfo() {
    this.route.params.subscribe((params: Params) => {
      this.mySessionId = params.roomName !== undefined ? params.roomName : this.sessionId;
      this.myUserName = this.user || 'OpenVidu_User' + Math.floor(Math.random() * 100);
    });
  }

  private deleteRemoteStream(stream: Stream): void {
    const userStream = this.remoteUsers.filter((user: UserModel) => user.streamManager.stream === stream)[0];
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
      const subscriber = this.session.subscribe(event.stream, undefined);
      subscriber.on('streamPlaying', (e: StreamManagerEvent) => {
        this.openviduLayout.updateLayout();
        (<HTMLElement>subscriber.videos[0].video).parentElement.classList.remove('custom-class');
      });
      const newUser = new UserModel();
      newUser.setStreamManager(subscriber);
      newUser.setConnectionId(event.stream.connection.connectionId);
      newUser.setNickname(JSON.parse(event.stream.connection.data).clientData);
      newUser.setType('remote');
      this.remoteUsers.push(newUser);
      this.sendSignalUserChanged({
        isAudioMuted: this.localUser.isAudioMuted(),
        isVideoMuted: this.localUser.isVideoMuted(),
        nickname: this.localUser.getNickname(),
      });
    });
  }

  private subscribedToStreamDestroyed() {
    this.session.on('streamDestroyed', (event: StreamEvent) => {
      this.deleteRemoteStream(event.stream);
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
         this.openviduLayout.updateLayout();
      }, 20);
      event.preventDefault();
    });
  }

  private connectToSession(): void {
    if (this.token) {
      this.connect(this.token);
    } else {
      this.openViduSrv.getToken(this.mySessionId, this.openviduServerUrl, this.openviduSecret).then((token) => {
        this.connect(token);
      }).catch((error) => {
        console.log('There was an error getting the token:', error.code, error.message);
        this.openDialogError('There was an error getting the token:', error.message);
      });
    }
  }

  private connect(token: string): void {
    this.session.connect(token, { clientData: this.myUserName })
        .then(() => {
          this.connectWebCam();
        })
        .catch((error) => {
          console.log('There was an error connecting to the session:', error.code, error.message);
          this.openDialogError('There was an error connecting to the session:', error.message);
        });
  }

  private connectWebCam(): void {
    this.localUser.streamManager = this.OV.initPublisher(undefined, {
      audioSource: undefined,
      videoSource: undefined,
      publishAudio: !this.localUser.isAudioMuted(),
      publishVideo: !this.localUser.isVideoMuted(),
      resolution: '640x480',
      frameRate: 30,
      insertMode: 'APPEND',
      mirror: false,
    });
    this.localUser.streamManager.on('streamPlaying', () => {
      this.openviduLayout.updateLayout();
      (<HTMLElement>this.localUser.streamManager.videos[0].video).parentElement.classList.remove('custom-class');
    });
    this.localUser.setNickname(this.myUserName);
    this.localUser.setConnectionId(this.session.connection.connectionId);
    this.localUser.setScreenShared(false);
    this.session.publish(<Publisher>this.localUser.streamManager);
    this.joinSession.emit();
  }

  private sendSignalUserChanged(data: any): void {
    const signalOptions: SignalOptions = {
      data: JSON.stringify(data),
      type: 'userChanged',
    };
    this.session.signal(signalOptions);
  }

  private openDialogError(message, messageError: string) {
    this.dialog.open(DialogErrorComponent, {
      width: '450px',
      data: { message: message, messageError: messageError },
    });
  }
}
