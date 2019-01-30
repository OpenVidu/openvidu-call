import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { UserModel } from '../../models/user-model';
import { NicknameMatcher } from '../../forms-matchers/nickname';
import { ApiService } from '../../services/api.service';
import { OpenVidu, Publisher } from 'openvidu-browser';
import { ActivatedRoute, Params } from '@angular/router';

interface IDevices {
  label: string;
  device: string;
}

@Component({
  selector: 'app-dialog-choose-room',
  templateUrl: './dialog-choose-room.component.html',
  styleUrls: ['./dialog-choose-room.component.css'],
})
export class DialogChooseRoomComponent implements OnInit {

  @Input() userNickname: string;
  @Input() sessionName: string;
  @Input() autopublish: boolean;
  @Output() join = new EventEmitter<any>();
  hover1: boolean;
  hover2: boolean;
  mySessionId: string;
  cameras: IDevices[] = [{ label: 'None', device: null }];
  microphones: IDevices[] = [{ label: 'None', device: null }];
  camValue: IDevices;
  micValue: IDevices;
  isVideoActive = true;
  isAudioActive = true;
  volumeValue = 100;

  user: UserModel = new UserModel();
  randomAvatar: string;
  videoAvatar: string;
  avatarSelected: string;
  columns: number;
  private OV: OpenVidu;

  nicknameFormControl = new FormControl('', [Validators.maxLength(25), Validators.required]);
  matcher = new NicknameMatcher();

  constructor(private route: ActivatedRoute, private apiSrv: ApiService) {}

  ngOnInit() {
    this.OV = new OpenVidu();
    this.generateNickname();
    this.setSessionName();
    this.setDevicesValue();
    this.getRandomAvatar();
    this.columns = (window.innerWidth > 900) ? 2 : 1;
  }

  toggleCam() {
    this.isVideoActive = !this.isVideoActive;
    this.user.setVideoActive(this.isVideoActive);
    (<Publisher>this.user.getStreamManager()).publishVideo(this.isVideoActive);
  }

  camChanged(label: string) {
    const initPublisherRequired = this.camValue.label !== 'None' && label !== 'None';
    const option = this.cameras.filter((opt: IDevices) => opt.label === label)[0];
    this.camValue = option;
    this.isVideoActive = this.camValue.label === 'None' ? false : true;
    this.user.setVideoActive(this.isVideoActive);
    (<Publisher>this.user.getStreamManager()).publishVideo(this.isVideoActive);
    if (initPublisherRequired) {
      this.launchNewPublisher();
    }
  }

  toggleMic() {
    this.isAudioActive = !this.isAudioActive;
    this.user.setAudioActive(this.isAudioActive);
    (<Publisher>this.user.getStreamManager()).publishAudio(this.isAudioActive);
  }

  micChanged(label: string) {
    const initPublisherRequired = this.micValue.label !== 'None' && label !== 'None';
    const option = this.microphones.filter((opt: IDevices) => opt.label === label)[0];
    this.micValue = option;
    this.isAudioActive = this.micValue.label === 'None' ? false : true;
    this.user.setAudioActive(this.isAudioActive);
    (<Publisher>this.user.getStreamManager()).publishAudio(this.isAudioActive);
    if (initPublisherRequired) {
      this.launchNewPublisher();
    }
  }

  subscribeToVolumeChange(publisher: Publisher) {
    publisher.on('streamAudioVolumeChange', (event: any) => {
      this.volumeValue = Math.round(Math.abs(event.value.newValue));
    });
  }

  setAvatar(option: string) {
    if ((option === 'random' && this.randomAvatar) || (option === 'video' && this.videoAvatar)) {
      this.avatarSelected = option;
      if (option === 'random') {
        this.user.setUserAvatar(this.randomAvatar);
      }
    }
  }

  takePhoto() {
    this.user.setUserAvatar();
    this.videoAvatar = this.user.getAvatar();
  }

  generateNickname() {
    const nickname = this.userNickname ? this.userNickname : 'OpenVidu_User' + Math.floor(Math.random() * 100);
    this.nicknameFormControl.setValue(nickname);
  }

  eventKeyPress(event) {
    if (event && event.keyCode === 13 && this.nicknameFormControl.valid) {
      this.accept();
    }
  }

  onResize(event) {
    this.columns = (event.target.innerWidth > 900) ? 2 : 1;
  }

  updateVolumeColor(): string {
    // max = 0 / min = 100
    if (this.volumeValue <= 20) {
      return 'warn';
    } else if (this.volumeValue > 20 && this.volumeValue <= 35) {
      return 'accent';
    } else if (this.volumeValue > 35) {
      return 'primary';
    }
  }

  accept() {
    if (this.nicknameFormControl.valid) {
      this.user.getStreamManager().off('streamAudioVolumeChange');
      this.user.setNickname(this.nicknameFormControl.value);
      this.join.emit({ user: this.user, sessionId: this.mySessionId });
    }
  }

  private setDevicesValue() {
    this.OV.getDevices().then((devices: any) => {
      console.log('Devices: ', devices);
      devices.forEach((device: any) => {
        if (device.kind === 'audioinput') {
          this.microphones.push({ label: device.label, device: device.deviceId });
        } else {
          this.cameras.push({ label: device.label, device: device.deviceId });
        }
      });
      this.camValue = this.cameras[1] ? this.cameras[1] : this.cameras[0];
      this.micValue = this.microphones[1] ? this.microphones[1] : this.microphones[0];
      this.initPublisher();
    }).catch((error) => console.error(error));
  }
  private setSessionName() {
    this.route.params.subscribe((params: Params) => {
      this.mySessionId = this.sessionName ? this.sessionName : params.roomName;
    });
  }

  private getRandomAvatar() {
    this.apiSrv.getRandomAvatar().then((avatar: string) => {
        this.randomAvatar = avatar;
        this.setAvatar('random');
      })
      .catch((err) => console.error(err));
  }

  private initPublisher() {
    this.OV.initPublisherAsync(undefined, {
      audioSource: this.micValue.device,
      videoSource: this.camValue.device,
      publishAudio: this.isAudioActive,
      publishVideo: this.isVideoActive,
      resolution: '640x480',
      frameRate: 30,
      insertMode: 'APPEND',
    }).then(publisher => {
      this.subscribeToVolumeChange(publisher);
      this.user.setStreamManager(publisher);
      if (this.autopublish) {
        this.accept();
      }
    }).catch((error) => console.error(error));
  }

  private launchNewPublisher() {
    this.destroyPublisher();
    this.initPublisher();
  }

  private destroyPublisher() {
    (<Publisher>this.user.getStreamManager()).off('streamAudioVolumeChange');
    this.user.getStreamManager().stream.disposeWebRtcPeer();
    this.user.getStreamManager().stream.disposeMediaStream();
  }
}
