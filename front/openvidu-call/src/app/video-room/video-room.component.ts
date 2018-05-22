import { Component, OnInit, OnDestroy, Input, HostListener } from '@angular/core';
import { OpenVidu, Session, Stream, StreamEvent, Publisher, SignalOptions } from 'openvidu-browser';
import { OpenViduService } from '../shared/services/open-vidu.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserModel } from '../shared/models/user-model';
import { MatDialog } from '@angular/material';
import { DialogNicknameComponent } from '../shared/components/dialog-nickname/dialog-nickname.component';

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.css'],
})
export class VideoRoomComponent implements OnInit, OnDestroy {
  localUser: UserModel = new UserModel();
  publisher: Publisher;
  remoteUsers: UserModel[] = [];

  // OpenVidu objects
  OV: OpenVidu;
  session: Session;

  // Streams to feed StreamComponent's
  localStream: Stream;

  // Join form
  mySessionId: string;
  myUserName: string;

  @Input() mainVideoStream: Stream;

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

  joinSession() {
    this.OV = new OpenVidu();
    this.session = this.OV.initSession();

    this.subscribeToUserChanged();
    this.subscribeToStreamCreated();
    this.subscribedToStreamDestroyed();

    this.openViduSrv.getToken(this.mySessionId).then((token) => {
      this.session
        .connect(token, { clientData: this.myUserName })
        .then(() => {
          this.publisher = this.OV.initPublisher(undefined, {
            audioSource: undefined, // The source of audio. If undefined default microphone
            videoSource: undefined, // The source of video. If undefined default webcam
            publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
            publishVideo: true, // Whether you want to start publishing with your video enabled or not
            resolution: '640x480', // The resolution of your video
            frameRate: 30, // The frame rate of your video
            insertMode: 'APPEND', // How the video is inserted in the target element 'video-container'
            mirror: false, // Whether to mirror your local video or not
          });
          this.localUser.setNickname(this.myUserName);
          this.localUser.setConnectionId(this.session.connection.connectionId);
          this.localUser.setStream(this.publisher.stream);
          this.localStream = this.publisher.stream;
          this.mainVideoStream = this.localStream;
          this.session.publish(this.publisher);
        })
        .catch((error) => {
          console.log('There was an error connecting to the session:', error.code, error.message);
        });
    });
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
    console.log(nickname);
    this.sendSignalUserChanged({ nickname: this.localUser.getNickname() });
  }

  nicknameClicked(connectionId: string) {
    if (connectionId === this.session.connection.connectionId) {
      const dialogRef = this.dialog.open(DialogNicknameComponent, {
        width: '250px',
        data: { nickname: this.localUser.getNickname() },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result !== undefined) {
          this.nicknameChanged(result);
        }
      });
    }
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

  private getMainVideoStream(stream: Stream) {
    this.mainVideoStream = stream;
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
    });
  }

  private sendSignalUserChanged(data: any): void {
    const signalOptions: SignalOptions = {
      data: JSON.stringify(data),
      type: 'userChanged',
    };
    this.session.signal(signalOptions);
  }
}
