import { Component, OnInit, OnDestroy, Input, HostListener } from '@angular/core';
import { OpenVidu, Session, Stream, StreamEvent } from 'openvidu-browser';
import { OpenViduService } from '../shared/services/open-vidu.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.css'],
})
export class VideoRoomComponent implements OnInit, OnDestroy {
  // OpenVidu objects
  OV: OpenVidu;
  session: Session;

  // Streams to feed StreamComponent's
  remoteStreams: Stream[] = [];
  localStream: Stream;

   // Join form
   mySessionId: string;
   myUserName: string;

  // Main video of the page, will be 'localStream' or one of the 'remoteStreams',
  // updated by an Output event of StreamComponent children
  @Input() mainVideoStream: Stream;

  constructor(private openViduSrv: OpenViduService, private router: Router, private route: ActivatedRoute) {
  }

  @HostListener('window:beforeunload')
  beforeunloadHandler() {
    // On window closed leave session
    this.leaveSession();
  }

  ngOnInit() {
    this.generateParticipantInfo();
    this.joinSession();

  }

  ngOnDestroy() {
    // On component destroyed leave session
    this.leaveSession();
  }

  joinSession() {
    this.OV = new OpenVidu();
    this.session = this.OV.initSession();
    this.session.on('streamCreated', (event: StreamEvent) => {
      // Add the new stream to 'remoteStreams' array
      this.remoteStreams.push(event.stream);

      // Subscribe to the Stream to receive it. Second parameter is undefined
      // so OpenVidu doesn't create an HTML video by its own
      this.session.subscribe(event.stream, undefined);
    });

    // On every Stream destroyed...
    this.session.on('streamDestroyed', (event: StreamEvent) => {
      // Remove the stream from 'remoteStreams' array
      this.deleteRemoteStream(event.stream);
    });

    // --- 4) Connect to the session with a valid user token ---

    // 'getToken' method is simulating what your server-side should do.
    // 'token' parameter should be retrieved and returned by your own backend
    this.openViduSrv.getToken(this.mySessionId).then((token) => {
      // First param is the token got from OpenVidu Server. Second param can be retrieved by every user on event
      // 'streamCreated' (property Stream.connection.data), and will be appended to DOM as the user's nickname
      this.session
        .connect(token, { clientData: this.myUserName })
        .then(() => {
          // --- 5) Get your own camera stream ---

          // Init a publisher passing undefined as targetElement (we don't want OpenVidu to insert a video
          // element: we will manage it ourselves) and with the desired properties
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

          // Store your webcam stream in 'localStream' object
          this.localStream = publisher.stream;
          // Set the main video in the page to display our webcam
          this.mainVideoStream = this.localStream;

          // --- 6) Publish your stream ---

          this.session.publish(publisher);
        })
        .catch((error) => {
          console.log('There was an error connecting to the session:', error.code, error.message);
        });
    });
  }

  leaveSession() {
    // --- 7) Leave the session by calling 'disconnect' method over the Session object ---

    if (this.session) {
      this.session.disconnect();
    }

    // Empty all properties...
    this.remoteStreams = [];
    this.localStream = null;
    this.session = null;
    this.OV = null;
    this.generateParticipantInfo();
    this.router.navigate(['']);
  }

  private generateParticipantInfo() {
    // Random user nickname
    this.route.params.subscribe((params: Params) => {
      this.mySessionId = params.roomName;
      this.myUserName = 'OpenVidu_User' + Math.floor(Math.random() * 100);
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
