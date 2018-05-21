import { Component, OnInit, OnDestroy, Input, HostListener } from '@angular/core';
import { OpenVidu, Session, Stream, StreamEvent, Publisher } from 'openvidu-browser';
import { OpenViduService } from '../shared/services/open-vidu.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.css'],
})
export class VideoRoomComponent implements OnInit, OnDestroy {
  roomLink: string;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  publisher: Publisher;
  remotePublishers: Publisher[] = [];

  // OpenVidu objects
  OV: OpenVidu;
  session: Session;

  // Streams to feed StreamComponent's
  remoteStreams: Stream[] = [];
  localStream: Stream;

  // Join form
  mySessionId: string;
  myUserName: string;

  @Input() mainVideoStream: Stream;

  constructor(private openViduSrv: OpenViduService, private router: Router, private route: ActivatedRoute) {}

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
    this.session.on('streamCreated', (event: StreamEvent) => {
      this.remoteStreams.push(event.stream);

      this.session.subscribe(event.stream, undefined);
    });

    this.session.on('streamDestroyed', (event: StreamEvent) => {
      this.deleteRemoteStream(event.stream);
    });

    this.openViduSrv.getToken(this.mySessionId).then((token) => {
      this.session.connect(token, { clientData: this.myUserName })
        .then(() => {
          const publisher = this.OV.initPublisher(undefined, {
            audioSource: undefined, // The source of audio. If undefined default microphone
            videoSource: undefined, // The source of video. If undefined default webcam
            publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
            publishVideo: true, // Whether you want to start publishing with your video enabled or not
            resolution: '640x480', // The resolution of your video
            frameRate: 30, // The frame rate of your video
            insertMode: 'APPEND', // How the video is inserted in the target element 'video-container'
            mirror: false, // Whether to mirror your local video or not
          });

          this.localStream = publisher.stream;
          this.publisher = publisher;
          this.mainVideoStream = this.localStream;
          console.log("sesion", this.session.connection);
          
          console.log("publisher", publisher);
          this.session.publish(publisher);
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

    this.remoteStreams = [];
    this.localStream = null;
    this.session = null;
    this.OV = null;
    this.generateParticipantInfo();
    this.router.navigate(['']);
  }

  changeMicStatus(): void {
    this.isAudioMuted = !this.isAudioMuted;
  }

  changeCamStatus(): void {
    this.isVideoMuted = !this.isVideoMuted;
  }

  private generateParticipantInfo() {
    // Random user nickname
    this.route.params.subscribe((params: Params) => {
      this.mySessionId = params.roomName;
      this.myUserName = 'OpenVidu_User' + Math.floor(Math.random() * 100);
      this.roomLink = 'http://' + location.hostname + ':4200/' + params.roomName;
    });
  }

  private deleteRemoteStream(stream: Stream): void {
    const index = this.remoteStreams.indexOf(stream, 0);
    if (index > -1) {
      this.remoteStreams.splice(index, 1);
    }
  }

  private getMainVideoStream(stream: Stream) {
    this.mainVideoStream = stream;
  }

}
