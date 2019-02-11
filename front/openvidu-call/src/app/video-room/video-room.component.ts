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
  @Input() token: string;
  @Input() theme: string;
  @Output() joinSession = new EventEmitter<any>();
  @Output() leaveSession = new EventEmitter<any>();
  @Output() error = new EventEmitter<any>();

  @ViewChild('chatComponent') chatComponent: ChatComponent;

  // Constants
  BIG_ELEMENT_CLASS = 'OV_big';

  // Variables
  compact = false;
  lightTheme: boolean;
  chatDisplay: 'none' | 'block' = 'none';
  showDialogExtension = false;
  showDialogChooseRoom = true;
  session: Session;
  sessionScreen: Session;
  openviduLayout: OpenViduLayout;
  openviduLayoutOptions: OpenViduLayoutOptions;
  mySessionId: string;
  myUserName: string;
  localUsers: UserModel[] = [];
  remoteUsers: UserModel[];
  messageList: { connectionId: string; nickname: string; message: string; userAvatar: string }[] = [];
  newMessages = 0;

  private OV: OpenVidu;
  private OVScreen: OpenVidu;
  private bigElement: HTMLElement;
  private userCamDeleted: UserModel;

  constructor(private openViduSrv: OpenViduService, private router: Router, public dialog: MatDialog) {}

  @HostListener('window:beforeunload')
  beforeunloadHandler() {
    this.exitSession();
  }

  @HostListener('window:resize', ['$event'])
  sizeChange(event) {
    this.openviduLayout.updateLayout();
    this.checkSizeComponent();
  }

  ngOnInit() {
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
    this.remoteUsers = [];
    this.checkTheme();
    setTimeout(() => {
      this.openviduLayout = new OpenViduLayout();
      this.openviduLayoutOptions = {
        maxRatio: 3 / 2, // The narrowest ratio that will be used (default 2x3)
        minRatio: 9 / 16, // The widest ratio that will be used (default 16x9)
        fixedRatio: false /* If this is true then the aspect ratio of the video is maintained
        and minRatio and maxRatio are ignored (default false) */,
        bigClass: this.BIG_ELEMENT_CLASS, // The class to add to elements that should be sized bigger
        bigPercentage: 0.8, // The maximum percentage of space the big ones should take up
        bigFixedRatio: false, // fixedRatio for the big ones
        bigMaxRatio: 3 / 2, // The narrowest ratio to use for the big elements (default 2x3)
        bigMinRatio: 9 / 16, // The widest ratio to use for the big elements (default 16x9)
        bigFirst: true, // Whether to place the big one in the top left (true) or bottom right
        animate: true, // Whether you want to animate the transitions
      };
      this.openviduLayout.initLayoutContainer(document.getElementById('layout'), this.openviduLayoutOptions);
      this.joinToSession();
    }, 50);
  }

  toggleChat(property: 'none' | 'block') {
    if (property) {
      this.chatDisplay = property;
    } else {
      this.chatDisplay = this.chatDisplay === 'none' ? 'block' : 'none';
    }
    if (this.chatDisplay === 'block') {
      this.newMessages = 0;
    }
    this.openviduLayout.updateLayout();
  }

  checkNotification() {
    if (this.chatDisplay === 'none') {
      this.newMessages++;
    } else {
      this.newMessages = 0;
    }
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
    this.remoteUsers = [];
    this.session = null;
    this.sessionScreen = null;
    this.localUsers = [];
    this.OV = null;
    this.OVScreen = null;
    this.openviduLayout = null;
    this.router.navigate(['']);
    this.leaveSession.emit();
  }

  stopCamera() {
    console.log('STOP CAMERA');
    this.session.unpublish(<Publisher>this.localUsers[0].getStreamManager());
    this.localUsers[0].setScreenShareActive(false);
    this.removeAndSaveFirstUser();
  }

  toggleMic(): void {
    this.localUsers[0].setAudioActive(!this.localUsers[0].isAudioActive());
    (<Publisher>this.localUsers[0].getStreamManager()).publishAudio(this.localUsers[0].isAudioActive());
    this.sendSignalUserChanged({ isAudioActive: this.localUsers[0].isAudioActive() }, this.localUsers[0].isScreen());
  }

  toggleCam(): void {
    /*if (this.localUsers[0].isLocal()) {
      this.localUsers[0].setVideoActive(!this.localUsers[0].isVideoActive());
      (<Publisher>this.localUsers[0].getStreamManager()).publishVideo(this.localUsers[0].isVideoActive());
      this.sendSignalUserChanged({ isVideoActive: this.localUsers[0].isVideoActive() });
    }*/
    if (this.localUsers.length === 2) {
      console.log('ARRAY 2 - TOGGLE CAM');
      // this.destroyPublisher(0);
      this.session.unpublish(<Publisher>this.localUsers[0].getStreamManager());
      this.removeAndSaveFirstUser();
    } else if (this.localUsers[0].isScreen()) {
      console.log('ARRAY 1, FIRST IS SCREEN - TOGGLE CAM');
      if (this.userCamDeleted) {
        this.setAudio(false);
        this.localUsers.unshift(this.userCamDeleted);
        this.session
          .publish(<Publisher>this.localUsers[0].getStreamManager())
          .then(() => {
            this.localUsers[0].setVideoActive(true);
            (<Publisher>this.localUsers[0].getStreamManager()).publishVideo(true);
            this.sendSignalUserChanged({ isVideoActive: this.localUsers[0].isVideoActive() });
          })
          .catch((error) => console.error(error));
      } else {
        this.createConnection(true);
      }
    } else {
      console.log('ARRAY 1, FIRST IS CAM - TOGGLE CAM');
      this.localUsers[0].setVideoActive(!this.localUsers[0].isVideoActive());
      (<Publisher>this.localUsers[0].getStreamManager()).publishVideo(this.localUsers[0].isVideoActive());
      this.sendSignalUserChanged({ isVideoActive: this.localUsers[0].isVideoActive() });
    }
    // this.openviduLayout.updateLayout();
  }

  nicknameChanged(nickname: string): void {
    if (this.localUsers[0].isLocal() || this.localUsers[0].isScreen()) {
      this.localUsers[0].setNickname(nickname);
      this.sendSignalUserChanged({ nickname: this.localUsers[0].getNickname() }, this.localUsers[0].isScreen());
    }
    if ((this.localUsers[1] && this.localUsers[1].isScreen())) {
      this.localUsers[1].setNickname(nickname);
      this.sendSignalUserChanged({ nickname: this.localUsers[1].getNickname() }, true);
    }
  }

  stopScreenSharing(): void {
    console.log('USERS ARRAY LENGTH', this.localUsers.length);
    if (this.localUsers.length === 2) {
      // STOP SCREEN SHARE & CAM IS ENABLE
      this.sessionScreen.unpublish(<Publisher>this.localUsers.pop().getStreamManager());
      // this.OVScreen = null;
      // this.sessionScreen = null;
      this.localUsers[0].setScreenShareActive(false);
      this.sendSignalUserChanged({
        isScreenShareActive: this.localUsers[0].isScreenShareActive(),
      });
    } else if (this.localUsers[0].isScreen()) {
      // STOP SCREEN SHARE && CAM IS DISABLE
      // PUBLISH CAM WITH AUDIO ONLY
      this.sessionScreen.unpublish(<Publisher>this.localUsers[0].getStreamManager());
      // this.sessionScreen = null;
      // this.OVScreen = null;
      this.localUsers.shift();
      this.localUsers.push(this.userCamDeleted);
      console.log('Users array ', this.localUsers);
      this.localUsers[0].setVideoActive(false);
      this.localUsers[0].setScreenShareActive(false);
      this.session.publish(<Publisher>this.localUsers[0].getStreamManager()).then(() => {
        (<Publisher>this.localUsers[0].getStreamManager()).publishVideo(this.localUsers[0].isVideoActive());
      });
    }
  }

  startScreenSharing(index: number) {
    console.log('STARTsCREENsHARING - ');
    /*this.localUsers[index].getStreamManager().on('streamPlaying', () => {
      this.openviduLayout.updateLayout();
      (<HTMLElement>this.localUsers[index].getStreamManager().videos[0].video).parentElement.classList.remove('custom-class');
    });*/
    this.openViduSrv
      .getToken(this.mySessionId, this.openviduServerUrl, this.openviduSecret)
      .then((token) => {
        this.sessionScreen
          .connect(token, { clientData: this.localUsers[index].getNickname() })
          .then(() => {
            /*const publisher = this.OVScreen.initPublisher(undefined, publisherProperties, (error) =>
                callbackError(error, this),
              );*/
            this.localUsers[index].getStreamManager().once('accessAllowed', () => {
              // this.localUsers.push(new UserModel());
              this.localUsers[index].setConnectionId(this.sessionScreen.connection.connectionId);
              // this.localUsers[index].setStreamManager(publisher);
              this.sessionScreen
                .publish(<Publisher>this.localUsers[index].getStreamManager())
                .then(() => {
                  this.localUsers[0].setScreenShareActive(true);
                  this.sendSignalUserChanged(
                    {
                      isScreenShareActive: this.localUsers[index].isScreenShareActive(),
                      avatar: this.localUsers[index].getAvatar(),
                    },
                    true,
                  );
                  if (!this.localUsers[0].isVideoActive()) {
                    this.session.unpublish(<Publisher>this.localUsers[0].getStreamManager());
                    this.removeAndSaveFirstUser();
                  }
                  this.openviduLayout.updateLayout();
                })
                .catch((error) => console.error(error));
            });

            /*if (this.sessionScreen.capabilities.publish) {
                  this.sessionScreen.publish(<Publisher>this.localUser.getStreamManager()).then(() => {
                    this.localUser.setScreenShareActive(true);
                    this.sendSignalUserChanged({ isScreenShareActive: this.localUser.isScreenShareActive() });
                    this.joinSession.emit();
                  }).catch((error) => console.error(error));
                }*/
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));
  }

  toggleDialogExtension() {
    this.showDialogExtension = !this.showDialogExtension;
  }

  toggleDialogChooseRoom(data: { localUsers: UserModel[]; sessionId: string }) {
    this.localUsers = [];
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
        // CHANGE CAMERA
        if ((this.localUsers[0].isLocal() && this.localUsers[1]) || this.localUsers[0].isScreen()) {
          publisher.once('accessAllowed', () => {
            const index = this.localUsers[0].isLocal() ? 1 : 0;
            this.sessionScreen.unpublish(<Publisher>this.localUsers[index].getStreamManager());
            this.localUsers[index].setStreamManager(publisher);
            this.sessionScreen.publish(publisher);
          });
        } else {
          // ADD NEW SCREEN USER
          console.log('STREAM SHARE - ELSE: posicion 1');
          this.localUsers.push(this.createScreenUser(publisher));
          this.startScreenSharing(1);
        }
      })
      .catch((error) => {
        if (error && error.name === 'SCREEN_EXTENSION_NOT_INSTALLED') {
          this.toggleDialogExtension();
        } else if (error && error.name === 'SCREEN_SHARING_NOT_SUPPORTED') {
          alert('Your browser does not support screen sharing');
        } else if (error && error.name === 'SCREEN_EXTENSION_DISABLED') {
          alert('You need to enable screen sharing extension');
        } else if (error && error.name === 'SCREEN_CAPTURE_DENIED') {
          alert('You need to choose a window or application to share');
        }
      });
  }

  checkSizeComponent() {
    if (document.getElementById('layout').offsetWidth <= 700) {
      this.compact = true;
      this.toggleChat('none');
    } else {
      this.compact = false;
    }
  }

  enlargeElement(event) {
    const element: HTMLElement = event.path.filter((e: HTMLElement) => e.className && e.className.includes('OT_root'))[0];
    if (this.bigElement) {
      this.bigElement.classList.remove(this.BIG_ELEMENT_CLASS);
    }
    if (this.bigElement !== element) {
      element.classList.add(this.BIG_ELEMENT_CLASS);
      this.bigElement = element;
    } else {
      this.bigElement = undefined;
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
      if ((this.localUsers[0] && this.localUsers[0].getConnectionId() !== connectionId) &&
          (this.localUsers[1] && this.localUsers[1].getConnectionId() !== connectionId) ||
          (this.localUsers[0] && !this.localUsers[1]  && this.localUsers[0].getConnectionId() !== connectionId)
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
        const type = event.stream.typeOfVideo === 'SCREEN' ? 'screen' : 'remote';
        newUser.setType(type);
        this.remoteUsers.push(newUser);

        this.localUsers.forEach((localUser) => {
          this.sendSignalUserChanged(
            {
              isAudioActive: localUser.isAudioActive(),
              isVideoActive: localUser.isVideoActive(),
              isScreenShareActive: localUser.isScreenShareActive(),
              nickname: localUser.getNickname(),
              avatar: localUser.getAvatar(),
            },
            localUser.isScreen(),
          );
        });
      }
    });
  }

  private connectToSession(): void {
    if (this.token) {
      this.connect(this.token);
    } else {
      this.localUsers.forEach((user, index) => {
        if (user.isScreen()) {
          this.startScreenSharing(index);
        } else {
          this.openViduSrv
            .getToken(this.mySessionId, this.openviduServerUrl, this.openviduSecret)
            .then((token) => {
              this.connect(token);
            })
            .catch((error) => {
              this.error.emit({ error: error.error, messgae: error.message, code: error.code, status: error.status });
              console.log('There was an error getting the token:', error.code, error.message);
              this.openDialogError('There was an error getting the token:', error.message);
            });
        }
      });
      if (this.localUsers.length === 1 && this.localUsers[0].isScreen()) {
        // this.createConnection(true);
      }
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

    if (this.session.capabilities.publish) {
      this.session
        .publish(<Publisher>this.localUsers[0].getStreamManager())
        .then(() => {
          // this.localUsers[0].setScreenShareActive(false);
          this.sendSignalUserChanged({
            isAudioActive: this.localUsers[0].isAudioActive(),
            isVideoActive: this.localUsers[0].isVideoActive(),
            isScreenShareActive: this.localUsers[0].isScreenShareActive(),
            nickname: this.localUsers[0].getNickname(),
            avatar: this.localUsers[0].getAvatar(),
          });
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
      //const avatar = messageOwner ? messageOwner.getAvatar() : this.localUsers[0].getAvatar();

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

  private sendSignalUserChanged(data: any, isScreen: boolean = false): void {
    const signalOptions: SignalOptions = {
      data: JSON.stringify(data),
      type: 'userChanged',
    };
    console.log('sendSignalUserChanged - IS SCREEN; ', isScreen);
    if (isScreen) {
      console.log('SEND SIGNAL CHANGED - SESSIONSCREEN');
      this.sessionScreen.signal(signalOptions);
    } else {
      console.log('SEND SIGNAL CHANGED - SESSION');
      this.session.signal(signalOptions);
    }
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
      this.userCamDeleted = this.localUsers.shift();
      this.setAudio(this.userCamDeleted.isAudioActive());
      this.openviduLayout.updateLayout();
    }, 200);
  }

  private setAudio(value: boolean) {
    this.localUsers[0].setAudioActive(value);
    (<Publisher>(this.localUsers[0].getStreamManager())).publishAudio(value);
  }

  private createScreenUser(publisher: StreamManager): UserModel {
    const user = new UserModel();
    user.setScreenShareActive(true);
    user.setType('screen');
    user.setStreamManager(publisher);
    user.setNickname(this.localUsers[0].getNickname());
    user.setUserAvatar(this.localUsers[0].getAvatar());
    user.setAudioActive(false);
    return user;
  }

  private createConnection(isCam: boolean) {
    const session = isCam ? this.session : this.sessionScreen;
    this.openViduSrv
      .getToken(this.mySessionId, this.openviduServerUrl, this.openviduSecret)
      .then((token) => {
        session.connect(token, { clientData: this.localUsers[0].getNickname() }).then(() => {
          const publisher = this.OV.initPublisher(undefined, {
            publishAudio: this.localUsers[0].isAudioActive(),
            publishVideo: true,
          });
          const newUser = new UserModel();
            newUser.setAudioActive(this.localUsers[0].isAudioActive());
            newUser.setUserAvatar(this.localUsers[0].getAvatar());
            newUser.setConnectionId(session.connection.connectionId);
            newUser.setNickname(this.localUsers[0].getNickname());
            newUser.setScreenShareActive(true);
            newUser.setStreamManager(publisher);
            this.userCamDeleted = newUser;
            this.openviduLayout.updateLayout();
            this.toggleCam();
            // session.publish(publisher).then(() => {});
        }).catch((error) => console.error(error));
      }).catch((error) => console.error(error));
  }

  private initPublisher() {
    this.OV.initPublisherAsync(undefined, {
      publishAudio: this.localUsers[0].isAudioActive(),
      publishVideo: true,
    }).then(publisher => {
      this.localUsers[0].setStreamManager(publisher);
    }).catch((error) => console.error(error));
  }
}
