import { Component, OnInit, OnDestroy, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { OpenVidu, Session, Stream, StreamEvent, Publisher, SignalOptions, StreamManagerEvent } from 'openvidu-browser';
import { OpenViduService } from '../shared/services/open-vidu.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserModel } from '../shared/models/user-model';
import { MatDialog } from '@angular/material';
import { OpenViduLayout, OpenViduLayoutOptions } from '../shared/layout/openvidu-layout';
import { DialogErrorComponent } from '../shared/components/dialog-error/dialog-error.component';

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.css'],
})
export class VideoRoomComponent implements OnInit, OnDestroy {

  // webComponent's inputs and outputs
  @Input() sessionName: string;
  @Input() user: string;
  @Input() openviduServerUrl: string;
  @Input() openviduSecret: string;
  @Input() token: string;
  @Input() theme: string;
  @Output() joinSession = new EventEmitter<any>();
  @Output() leaveSession = new EventEmitter<any>();
  @Output() error = new EventEmitter<any>();

  compact = false;
  messageReceived = false;
  lightTheme: boolean;
  chatDisplay: 'none' | 'block' = 'none';
  showDialogExtension = false;

  OV: OpenVidu;
  session: Session;
  openviduLayout: OpenViduLayout;
  openviduLayoutOptions: OpenViduLayoutOptions;
  mySessionId: string;
  myUserName: string;
  localUser: UserModel;
  remoteUsers: UserModel[];
  resizeTimeout;

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
    this.checkSizeComponent();
  }

  ngOnInit() {
    this.localUser = new UserModel();
    this.localUser.setType('local');
    this.remoteUsers = [];
    this.generateParticipantInfo();
    this.checkTheme();
    this.joinToSession();
    this.openviduLayout = new OpenViduLayout();
    this.openviduLayoutOptions = {
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
    };
    this.openviduLayout.initLayoutContainer(document.getElementById('layout'), this.openviduLayoutOptions);
  }

  ngOnDestroy() {
    this.exitSession();
  }

  toggleChat(property: 'none' | 'block') {
    if (property) {
      this.chatDisplay = property;
    } else {
      this.chatDisplay = this.chatDisplay === 'none' ? 'block' : 'none';
    }
    if (this.chatDisplay === 'block') {
      this.messageReceived = false;
    }
    setTimeout(() => this.openviduLayout.updateLayout(), 20);
  }

  checkNotification() {
    this.messageReceived = this.chatDisplay === 'none';
  }

  joinToSession() {
    this.OV = new OpenVidu();
    this.session = this.OV.initSession();
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
    this.router.navigate(['']);
    this.leaveSession.emit();
  }

  micStatusChanged(): void {
    this.localUser.setAudioActive(!this.localUser.isAudioActive());
    (<Publisher>this.localUser.getStreamManager()).publishAudio(this.localUser.isAudioActive());
    this.sendSignalUserChanged({ isAudioActive: this.localUser.isAudioActive() });
  }

  camStatusChanged(): void {
    this.localUser.setVideoActive(!this.localUser.isVideoActive());
    (<Publisher>this.localUser.getStreamManager()).publishVideo(this.localUser.isVideoActive());
    this.sendSignalUserChanged({ isVideoActive: this.localUser.isVideoActive() });
  }

  nicknameChanged(nickname: string): void {
    this.localUser.setNickname(nickname);
    this.sendSignalUserChanged({ nickname: this.localUser.getNickname() });
  }

  screenShareDisabled(): void {
    this.session.unpublish(<Publisher>this.localUser.getStreamManager());
    this.connectWebCam();
  }

  toggleDialogExtension() {
    this.showDialogExtension = !this.showDialogExtension;
  }

  screenShare() {
    const publisher = this.OV.initPublisher(undefined, {
        videoSource: 'screen',
        publishAudio: this.localUser.isAudioActive(),
        publishVideo: this.localUser.isVideoActive(),
        mirror: false,
      },
      (error) => {
        if (error && error.name === 'SCREEN_EXTENSION_NOT_INSTALLED') {
          this.toggleDialogExtension();
        } else if (error && error.name === 'SCREEN_SHARING_NOT_SUPPORTED') {
          alert('Your browser does not support screen sharing');
        } else if (error && error.name === 'SCREEN_EXTENSION_DISABLED') {
          alert('You need to enable screen sharing extension');
        } else if (error && error.name === 'SCREEN_CAPTURE_DENIED') {
          alert('You need to choose a window or application to share');
        }
      }
    );

    publisher.once('accessAllowed', () => {
      this.session.unpublish(<Publisher>this.localUser.getStreamManager());
      this.localUser.setStreamManager(publisher);
      this.session.publish(<Publisher>this.localUser.getStreamManager()).then(() => {
      this.localUser.setScreenShareActive(true);
      this.sendSignalUserChanged({ isScreenShareActive: this.localUser.isScreenShareActive() });
      });
    });

    publisher.on('streamPlaying', () => {
      this.openviduLayout.updateLayout();
      (<HTMLElement>publisher.videos[0].video).parentElement.classList.remove('custom-class');
    });
  }

  checkSizeComponent() {
    if (document.getElementById('layout').offsetWidth <= 700) {
      this.compact = true;
    } else {
      this.compact = false;
    }
  }

  private generateParticipantInfo() {
    this.route.params.subscribe((params: Params) => {
      this.mySessionId = params.roomName !== undefined ? params.roomName : this.sessionName;
      this.myUserName = this.user || 'OpenVidu_User' + Math.floor(Math.random() * 100);
    });
  }

  private deleteRemoteStream(stream: Stream): void {
    const userStream = this.remoteUsers.filter((user: UserModel) => user.getStreamManager().stream === stream)[0];
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
          if (data.isAudioActive !== undefined) {
            user.setAudioActive(data.isAudioActive);
          }
          if (data.isVideoActive !== undefined) {
            user.setVideoActive(data.isVideoActive);
          }
          if (data.nickname !== undefined) {
            user.setNickname(data.nickname);
          }
          if (data.isScreenShareActive !== undefined) {
            user.setScreenShareActive(data.isScreenShareActive);
          }
        }
      });
      this.checkSomeoneShareScreen();
    });
  }

  private subscribeToStreamCreated() {
    this.session.on('streamCreated', (event: StreamEvent) => {
      const subscriber = this.session.subscribe(event.stream, undefined);
      subscriber.on('streamPlaying', (e: StreamManagerEvent) => {
        this.checkSomeoneShareScreen();
        (<HTMLElement>subscriber.videos[0].video).parentElement.classList.remove('custom-class');
      });
      const newUser = new UserModel();
      newUser.setStreamManager(subscriber);
      newUser.setConnectionId(event.stream.connection.connectionId);
      const nickname = (event.stream.connection.data).split('%')[0];
      newUser.setNickname(JSON.parse(nickname).clientData);
      newUser.setType('remote');
      this.remoteUsers.push(newUser);
      this.sendSignalUserChanged({
        isAudioActive: this.localUser.isAudioActive(),
        isVideoActive: this.localUser.isVideoActive(),
        isScreenShareActive: this.localUser.isScreenShareActive(),
        nickname: this.localUser.getNickname(),
      });
    });
  }

  private subscribedToStreamDestroyed() {
    this.session.on('streamDestroyed', (event: StreamEvent) => {
      this.deleteRemoteStream(event.stream);
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.checkSomeoneShareScreen();
      }, 20);
      event.preventDefault();
    });
  }

  private connectToSession(): void {
    if (this.token) {
      this.connect(this.token);
    } else {
      this.openViduSrv.getToken(this.mySessionId, this.openviduServerUrl, this.openviduSecret)
        .then((token) => {
          this.connect(token);
        })
        .catch((error) => {
          this.error.emit({ error: error.error, messgae: error.message, code: error.code, status: error.status });
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
        this.error.emit({ error: error.error, messgae: error.message, code: error.code, status: error.status });
        console.log('There was an error connecting to the session:', error.code, error.message);
        this.openDialogError('There was an error connecting to the session:', error.message);
      });
  }

  private connectWebCam(): void {
    this.localUser.setStreamManager(this.OV.initPublisher(undefined, {
      audioSource: undefined,
      videoSource: undefined,
      publishAudio: this.localUser.isAudioActive(),
      publishVideo: this.localUser.isVideoActive(),
      resolution: '640x480',
      frameRate: 30,
      insertMode: 'APPEND',
      mirror: false,
    }));

    this.session.publish(<Publisher>this.localUser.getStreamManager()).then(() => {
      this.joinSession.emit();
    });
    this.localUser.setNickname(this.myUserName);
    this.localUser.setConnectionId(this.session.connection.connectionId);
    this.localUser.setScreenShareActive(false);
    this.sendSignalUserChanged({ isScreenShareActive: this.localUser.isScreenShareActive() });

    this.localUser.getStreamManager().on('streamPlaying', () => {
      this.openviduLayout.updateLayout();
      (<HTMLElement>this.localUser.getStreamManager().videos[0].video).parentElement.classList.remove('custom-class');
    });
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

  private checkSomeoneShareScreen() {
    let isScreenShared: boolean;
    // return true if at least one passes the test
    isScreenShared = this.remoteUsers.some((user) => user.isScreenShareActive()) || this.localUser.isScreenShareActive();
    this.openviduLayoutOptions.fixedRatio = isScreenShared;
    this.openviduLayoutOptions.bigFixedRatio = isScreenShared;
    this.openviduLayout.setLayoutOptions(this.openviduLayoutOptions);
    this.openviduLayout.updateLayout();
  }

  private checkTheme() {
      this.lightTheme = this.theme === 'light';
  }
}
