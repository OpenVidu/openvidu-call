import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import {
  OpenVidu,
  Publisher,
  Session,
  SignalOptions,
  Stream,
  StreamEvent,
  StreamManagerEvent,
  StreamManager,
} from 'openvidu-browser';
import { DialogErrorComponent } from '../shared/components/dialog-error/dialog-error.component';
import { OpenViduLayout, OpenViduLayoutOptions } from '../shared/layout/openvidu-layout';
import { UserModel } from '../shared/models/user-model';
import { OpenViduService } from '../shared/services/open-vidu.service';
import { ChatComponent } from '../shared/components/chat/chat.component';
import { OvSettings } from '../shared/models/ov-settings';
import { ApiService } from '../shared/services/api.service';

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.css'],
})
export class VideoRoomComponent implements OnInit, OnDestroy {
  // webComponent's inputs and outputs
  @Input() ovSettings: OvSettings;
  @Input() sessionName: string;
  @Input() user: string;
  @Input() openviduServerUrl: string;
  @Input() openviduSecret: string;
  @Input() tokens: string[];
  @Input() theme: string;
  @Input() isWebComponent: boolean;
  @Output() joinSession = new EventEmitter<any>();
  @Output() leaveSession = new EventEmitter<any>();
  @Output() error = new EventEmitter<any>();

  @ViewChild('chatComponent', {static: false}) chatComponent: ChatComponent;
  @ViewChild('sidenav', {static: false}) chat: any;

  // Constants
  BIG_ELEMENT_CLASS = 'OV_big';
  SCREEN_TYPE: 'screen' = 'screen';
  REMOTE_TYPE: 'remote' = 'remote';

  // Variables
  compact = false;
  sidenavMode: 'side' | 'over' = 'side';
  lightTheme: boolean;
  chatOpened: boolean;
  showDialogExtension = false;
  showDialogChooseRoom = true;
  session: Session;
  sessionScreen: Session;
  openviduLayout: OpenViduLayout;
  openviduLayoutOptions: OpenViduLayoutOptions;
  mySessionId: string;
  myUserName: string;
  localUsers: UserModel[] = [];
  remoteUsers: UserModel[] = [];
  messageList: { connectionId: string; nickname: string; message: string; userAvatar: string }[] = [];
  newMessages = 0;

  private OV: OpenVidu;
  private OVScreen: OpenVidu;
  private userCamDeleted: UserModel;

  constructor(
    private openViduSrv: OpenViduService,
    private router: Router,
    public dialog: MatDialog,
    private apiSrv: ApiService,
  ) {}

  @HostListener('window:beforeunload')
  beforeunloadHandler() {
    this.exitSession();
  }

  @HostListener('window:resize')
  sizeChange() {
    if (this.openviduLayout) {
      this.openviduLayout.updateLayout();
      this.checkSizeComponent();
    }
  }

  ngOnInit() {
    this.checkTheme();
    this.openViduSrv
      .getOvSettingsData()
      .then((data: OvSettings) => {
        this.ovSettings = this.ovSettings ? this.ovSettings : data;
      })
      .catch((error) => console.error(error));
  }

  ngOnDestroy() {
    this.exitSession();
  }

  initApp() {
    setTimeout(() => {
      this.openviduLayout = new OpenViduLayout();
      this.openviduLayoutOptions = this.apiSrv.getOpenviduLayoutOptions();
      this.openviduLayout.initLayoutContainer(document.getElementById('layout'), this.openviduLayoutOptions);
      this.checkSizeComponent();
      this.joinToSession();
    }, 50);
  }

  toggleChat() {
    this.chat.toggle().then(() => {
      this.chatOpened = this.chat.opened;
      if (this.chatOpened) {
        this.newMessages = 0;
      }
      const ms = this.isWebComponent ? 300 : 0;
      setTimeout(() => this.openviduLayout.updateLayout(), ms);
    });
  }

  checkNotification() {
    this.newMessages = this.chatOpened ? 0 : this.newMessages + 1;
  }

  joinToSession() {
    this.OV = new OpenVidu();
    this.OVScreen = new OpenVidu();
    this.session = this.OV.initSession();
    this.sessionScreen = this.OVScreen.initSession();
    this.subscribeToUserChanged();
    this.subscribeToStreamCreated();
    this.subscribedToStreamDestroyed();
    this.subscribedToChat();
    this.connectToSession();
  }

  exitSession() {
    if (this.sessionScreen) {
      this.sessionScreen.disconnect();
    }
    if (this.session) {
      this.session.disconnect();
    }
    this.OV = null;
    this.OVScreen = null;
    this.session = null;
    this.sessionScreen = null;
    this.userCamDeleted = null;
    this.localUsers = [];
    this.remoteUsers = [];
    this.openviduLayout = null;
    this.router.navigate(['']);
    this.leaveSession.emit();
  }

  nicknameChanged(nickname: string): void {
    this.localUsers.forEach((user) => {
      user.setNickname(nickname);
      this.sendSignalUserChanged(user);
    });
  }

  toggleMic(): void {
    this.localUsers[0].setAudioActive(!this.localUsers[0].isAudioActive());
    (<Publisher>this.localUsers[0].getStreamManager()).publishAudio(this.localUsers[0].isAudioActive());
    this.sendSignalUserChanged(this.localUsers[0]);
  }

  toggleCam(): void {
    if (this.localUsers.length === 2) {
      // TWO USERS, STOP CAMERA
      console.log('TWO USERS - STOP CAM');
      this.stopCamera();
    } else if (this.localUsers[0].isScreen()) {
      // SCREEN USER, START CAMERA
      console.log('USER IS SCREEN - START CAM');
      if (this.userCamDeleted) {
        // Setting local connection ID to Screen User
        this.localUsers[0].setLocalConnectionId(this.session.connection.connectionId);
        this.userCamDeleted.setNickname(this.localUsers[0].getNickname());
        if (!this.userCamDeleted.getStreamManager()) {
          this.OV.initPublisherAsync(undefined, {
            publishAudio: this.localUsers[0].isAudioActive(),
            publishVideo: true,
          }).then((publisher) => {
            this.userCamDeleted.setStreamManager(publisher);
            this.publishCamSession();
          });
        } else {
          this.publishCamSession();
        }
      }
    } else {
      // CAM USER, MUTE / UNMUTE CAMERA
      console.log('USER IS CAM - MUTE / UNMUTE CAM');
      this.localUsers[0].setVideoActive(!this.localUsers[0].isVideoActive());
      (<Publisher>this.localUsers[0].getStreamManager()).publishVideo(this.localUsers[0].isVideoActive());
      this.sendSignalUserChanged(this.localUsers[0]);
    }
  }

  publishCamSession(){
    const hasAudio = this.localUsers[0].isAudioActive();
    this.setFirstUserAudio(false);
    this.localUsers.unshift(this.userCamDeleted);
    this.localUsers[0].setVideoActive(true);
    this.localUsers[0].setAudioActive(hasAudio);
    this.publishSession(this.localUsers[0]).then(() => {
      (<Publisher>this.localUsers[0].getStreamManager()).publishVideo(true);
      (<Publisher>this.localUsers[0].getStreamManager()).publishAudio(hasAudio);
      this.sendSignalUserChanged(this.localUsers[0]);
    })
      .catch((error) => console.error(error));
  }

  startScreenSharing(i: number, tokenReceived?: string) {
    console.log('STARTsCREENsHARING - ');
    this.getToken().then((tokenResponse) => {
      const token = tokenReceived ? tokenReceived : tokenResponse;
        this.sessionScreen
          .connect(token, { clientData: this.localUsers[i].getNickname() })
          .then(() => {
            this.localUsers[i].getStreamManager().once('accessAllowed', () => {
              this.localUsers[i].setConnectionId(this.sessionScreen.connection.connectionId);
              if (this.session.connection && this.session.connection.connectionId) {
                this.localUsers[i].setLocalConnectionId(this.session.connection.connectionId);
              }
              this.publishSession(this.localUsers[i]).then(() => {
                  this.localUsers[0].setScreenShareActive(true);
                  this.sendSignalUserChanged(this.localUsers[i]);
                  if (!this.localUsers[0].isVideoActive()) {
                    // REMOVE CAM STREAM
                    this.stopCamera();
                  }
                  this.joinSession.emit();
                  this.openviduLayout.updateLayout();
                })
                .catch((error) => console.error(error));
            });
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));
  }

  stopScreenSharing(): void {
    console.log('USERS ARRAY LENGTH', this.localUsers.length);
    if (this.localUsers.length === 2) {
      // STOP SCREEN SHARE & CAM IS ENABLE
      this.sessionScreen.unpublish(<Publisher>this.localUsers.pop().getStreamManager());
      this.localUsers[0].setScreenShareActive(false);
      this.sendSignalUserChanged(this.localUsers[0]);
    } else if (this.localUsers[0].isScreen()) {
      // STOP SCREEN SHARE && CAM IS DISABLE
      // PUBLISH CAM WITH AUDIO ONLY
      this.sessionScreen.unpublish(<Publisher>this.localUsers[0].getStreamManager());
      this.localUsers.shift();
      this.localUsers.push(this.userCamDeleted);
      console.log('Users array ', this.localUsers);
      this.localUsers[0].setVideoActive(false);
      this.localUsers[0].setScreenShareActive(false);
      this.session.publish(<Publisher>this.localUsers[0].getStreamManager()).then(() => {
        (<Publisher>this.localUsers[0].getStreamManager()).publishVideo(this.localUsers[0].isVideoActive());
        this.sendSignalUserChanged(this.localUsers[0]);
      });
    }
  }

  toggleDialogExtension() {
    this.showDialogExtension = !this.showDialogExtension;
  }

  toggleDialogChooseRoom(data: { localUsers: UserModel[]; sessionId: string }) {
    this.showDialogChooseRoom = false;
    this.localUsers = data.localUsers;
    this.mySessionId = data.sessionId;
    this.initApp();
  }

  screenShareAndChangeScreen() {
    const videoSource = navigator.userAgent.indexOf('Firefox') !== -1 ? 'window' : 'screen';
    const hasAudio = this.localUsers[0].isLocal() ? false : true;
    const publisherProperties = {
      videoSource: videoSource,
      publishAudio: hasAudio,
      publishVideo: true,
      mirror: false,
    };
    this.OVScreen.initPublisherAsync(undefined, publisherProperties)
      .then((publisher: Publisher) => {
        publisher.once('accessAllowed', () => {
          // CHANGE CAMERA
          if ((this.localUsers[0].isLocal() && this.localUsers[1]) || this.localUsers[0].isScreen()) {
              const index = this.localUsers[0].isLocal() ? 1 : 0;
              this.sessionScreen.unpublish(<Publisher>this.localUsers[index].getStreamManager());
              this.localUsers[index].setStreamManager(publisher);
              this.sessionScreen.publish(publisher);
          } else {
            // ADD NEW SCREEN USER
            console.log('STREAM SHARE - ELSE: position 1');
            this.localUsers.push(this.createScreenUser(publisher));
            this.startScreenSharing(1);
          }
        });
      })
      .catch((error) => {
        if (error && error.name === 'SCREEN_EXTENSION_NOT_INSTALLED') {
          this.toggleDialogExtension();
        } else {
          this.apiSrv.handlerScreenShareError(error);
        }
      });
  }

  checkSizeComponent() {
    this.compact = document.getElementById('room-container').offsetWidth <= 790;
    this.sidenavMode = this.compact ? 'over' : 'side';
  }

  enlargeElement(event) {
    const path = event.path ? event.path : event.composedPath(); // Chrome or Firefox
    const element: HTMLElement = path.filter((e: HTMLElement) => e.className && e.className.includes('OT_root'))[0];
    if (element.className.includes(this.BIG_ELEMENT_CLASS)) {
      element.classList.remove(this.BIG_ELEMENT_CLASS);
    } else {
      element.classList.add(this.BIG_ELEMENT_CLASS);
    }
    this.openviduLayout.updateLayout();
  }

  private deleteRemoteStream(stream: Stream): void {
    const userStream = this.remoteUsers.filter((user: UserModel) => user.getStreamManager().stream === stream)[0];
    const index = this.remoteUsers.indexOf(userStream, 0);
    if (index > -1) {
      this.remoteUsers.splice(index, 1);
    }
  }

  private subscribeToStreamCreated() {
    this.session.on('streamCreated', (event: StreamEvent) => {
      const connectionId = event.stream.connection.connectionId;
      if (
        (this.localUsers[0] &&
          this.localUsers[0].getConnectionId() !== connectionId &&
          (this.localUsers[1] && this.localUsers[1].getConnectionId() !== connectionId)) ||
        (this.localUsers[0] && !this.localUsers[1] && this.localUsers[0].getConnectionId() !== connectionId)
      ) {
        const subscriber = this.session.subscribe(event.stream, undefined);
        subscriber.on('streamPlaying', (e: StreamManagerEvent) => {
          this.checkSomeoneShareScreen();
          (<HTMLElement>subscriber.videos[0].video).parentElement.classList.remove('custom-class');
        });
        const newUser = new UserModel();
        newUser.setStreamManager(subscriber);
        newUser.setConnectionId(event.stream.connection.connectionId);
        const nickname = event.stream.connection.data.split('%')[0];
        newUser.setNickname(JSON.parse(nickname).clientData);
        const type = event.stream.typeOfVideo === 'SCREEN' ? this.SCREEN_TYPE : this.REMOTE_TYPE;
        newUser.setType(type);
        this.remoteUsers.push(newUser);

        this.localUsers.forEach((user) => {
          this.sendSignalUserChanged(user);
        });
      }
    });
  }

  private connectToSession(): void {
    if (this.tokens) { // Retrieves tokens from subcomponent or library
        this.localUsers.forEach((user, index) => {
          if (user.isLocal()) {
            this.connect(this.tokens[index]);
          } else if (user.isScreen()) {
            this.startScreenSharing(index);
          }
        });
    } else {
      this.localUsers.forEach((user, index) => {
        if (user.isScreen()) {
          this.startScreenSharing(index);
        } else {
          this.getToken().then((token) => {
              this.connect(token);
            })
            .catch((error) => {
              this.error.emit({ error: error.error, messgae: error.message, code: error.code, status: error.status });
              console.log('There was an error getting the token:', error.code, error.message);
              this.openDialogError('There was an error getting the token:', error.message);
            });
        }
      });
    }
    if (this.localUsers.length === 1 && this.localUsers[0].isScreen()) {
      // CREATING CAM USER AND SAVING LIKE USERCAMDELETED
      this.createCamConnection();
    }
  }

  private connect(token: string): void {
    this.session
      .connect(token, { clientData: this.localUsers[0].getNickname() })
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
    this.localUsers[0].setConnectionId(this.session.connection.connectionId);
    this.localUsers[0].setLocalConnectionId(this.session.connection.connectionId);
    if (this.session.capabilities.publish) {
      this.publishSession(this.localUsers[0]).then(() => {
          this.sendSignalUserChanged(this.localUsers[0]);
          this.joinSession.emit();
      })
        .catch((error) => console.error(error));
      this.localUsers[0].getStreamManager().on('streamPlaying', () => {
        this.openviduLayout.updateLayout();
        (<HTMLElement>this.localUsers[0].getStreamManager().videos[0].video).parentElement.classList.remove('custom-class');
      });
    }
  }

  private subscribeToUserChanged() {
    this.session.on('signal:userChanged', (event: any) => {
      const data = JSON.parse(event.data);
      this.remoteUsers.forEach((user: UserModel) => {
        if (user.getConnectionId() === event.from.connectionId) {
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
          if (data.avatar !== undefined) {
            user.setUserAvatar(data.avatar);
          }
        }
      });
      this.checkSomeoneShareScreen();
    });
  }

  private subscribedToStreamDestroyed() {
    this.session.on('streamDestroyed', (event: StreamEvent) => {
      this.deleteRemoteStream(event.stream);
      this.checkSomeoneShareScreen();
      event.preventDefault();
    });
  }

  private subscribedToChat() {
    this.session.on('signal:chat', (event: any) => {
      const data = JSON.parse(event.data);
      const messageOwner =
        this.localUsers[0].getConnectionId() === data.connectionId
          ? this.localUsers[0]
          : this.remoteUsers.filter((user) => user.getConnectionId() === data.connectionId)[0];
      this.messageList.push({
        connectionId: data.connectionId,
        nickname: data.nickname,
        message: data.message,
        userAvatar: messageOwner.getAvatar(),
      });
      this.checkNotification();
      this.chatComponent.scrollToBottom();
    });
  }

  private sendSignalUserChanged(user: UserModel): void {
    const session = user.isLocal() ? this.session : this.sessionScreen;
    const data = {
      isAudioActive: user.isAudioActive(),
      isVideoActive: user.isVideoActive(),
      isScreenShareActive: user.isScreenShareActive(),
      nickname: user.getNickname(),
      avatar: user.getAvatar(),
    };
    const signalOptions: SignalOptions = {
      data: JSON.stringify(data),
      type: 'userChanged',
    };
    session.signal(signalOptions);
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
    isScreenShared = this.remoteUsers.some((user) => user.isScreenShareActive()) || this.localUsers[0].isScreenShareActive();
    this.openviduLayoutOptions.fixedRatio = isScreenShared;
    this.openviduLayout.setLayoutOptions(this.openviduLayoutOptions);
    this.openviduLayout.updateLayout();
  }

  private checkTheme() {
    this.lightTheme = this.theme === 'light';
  }

  private removeAndSaveFirstUser() {
    setTimeout(() => {
      this.localUsers[0].setVideoActive(false);
      this.userCamDeleted = this.localUsers.shift();
      this.setFirstUserAudio(this.userCamDeleted.isAudioActive());
      this.openviduLayout.updateLayout();
    }, 200);
  }

  private setFirstUserAudio(value: boolean) {
    this.localUsers[0].setAudioActive(value);
    (<Publisher>this.localUsers[0].getStreamManager()).publishAudio(value);
  }

  private stopCamera() {
    console.log('STOP CAMERA');
    (<Publisher>this.localUsers[0].getStreamManager()).publishVideo(false);
    this.session.unpublish(<Publisher>this.localUsers[0].getStreamManager());
    this.removeAndSaveFirstUser();
  }

  private createScreenUser(publisher: StreamManager): UserModel {
    const user = new UserModel();
    user.setScreenShareActive(true);
    user.setType(this.SCREEN_TYPE);
    user.setStreamManager(publisher);
    user.setNickname(this.localUsers[0].getNickname());
    user.setUserAvatar(this.localUsers[0].getAvatar());
    user.setAudioActive(false);
    return user;
  }

  private createCamConnection() {
    this.getToken().then((token) => {
        this.session.connect(token, { clientData: this.localUsers[0].getNickname() })
          .then(() => {
            const newUser = new UserModel();
            const audioActive = this.localUsers[0].isAudioActive();
            newUser.setAudioActive(audioActive);
            newUser.setUserAvatar(this.localUsers[0].getAvatar());
            newUser.setConnectionId(this.session.connection.connectionId);
            newUser.setLocalConnectionId(this.session.connection.connectionId);
            newUser.setNickname(this.localUsers[0].getNickname());
            newUser.setScreenShareActive(true);
            this.userCamDeleted = newUser;
            this.openviduLayout.updateLayout();
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));
  }

  private getToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.openViduSrv
        .getToken(this.mySessionId, this.openviduServerUrl, this.openviduSecret)
        .then((token) => {
          resolve(token);
        })
        .catch((error) => reject(error));
    });
  }

  private publishSession(user: UserModel): Promise<any> {
    return new Promise((resolve, reject) => {
      const session = user.isLocal() ? this.session : this.sessionScreen;
      session.publish(<Publisher>user.getStreamManager()).then(() => {
        resolve();
      }).catch((error) => reject(error));
    });
  }
}
