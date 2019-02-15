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
  screenActive: 'None' | 'Screen' = 'None';
  camValue: IDevices;
  micValue: IDevices;
  isVideoActive = true;
  isAudioActive = true;
  isScreenShareActive = false;
  volumeValue = 100;
  showDialogExtension = false;

  localUsers: UserModel[] = [];
  randomAvatar: string;
  videoAvatar: string;
  avatarSelected: 'random' | 'video';
  columns: number;
  private OV: OpenVidu;
  private userCamDeleted: UserModel;

  nicknameFormControl = new FormControl('', [Validators.maxLength(25), Validators.required]);
  matcher = new NicknameMatcher();

  constructor(private route: ActivatedRoute, private apiSrv: ApiService) {}

  ngOnInit() {
    this.OV = new OpenVidu();
    this.localUsers.push(new UserModel());
    this.generateNickname();
    this.setSessionName();
    this.setDevicesValue();
    this.getRandomAvatar();
    this.columns = (window.innerWidth > 900) ? 2 : 1;
  }

  toggleCam() {
    this.isVideoActive = !this.isVideoActive;
    if (this.localUsers.length === 2) {
      this.destroyPublisher(0);
      this.userCamDeleted = this.localUsers.shift();
      this.setAudio(this.isAudioActive);
    } else if (this.localUsers[0].isScreen()) {
      this.setAudio(false);
      (<Publisher>this.localUsers[0].getStreamManager()).off('streamAudioVolumeChange');
      this.localUsers.unshift(this.userCamDeleted);
      this.initPublisher();
    } else {
      this.localUsers[0].setVideoActive(this.isVideoActive);
      (<Publisher>this.localUsers[0].getStreamManager()).publishVideo(this.isVideoActive);
    }
  }

  camChanged(label: string) {
    const initPublisherRequired = this.camValue.label !== 'None' && label !== 'None';
    const option = this.cameras.filter((opt: IDevices) => opt.label === label)[0];
    this.camValue = option;
    this.isVideoActive = this.camValue.label === 'None' ? false : true;
    if (this.localUsers[0].isLocal()) {
      this.localUsers[0].setVideoActive(this.isVideoActive);
      (<Publisher>this.localUsers[0].getStreamManager()).publishVideo(this.isVideoActive);
      if (initPublisherRequired) {
        this.launchNewPublisher(0);
      }
    } else {
      this.localUsers.unshift(this.userCamDeleted);
      this.initPublisher();
    }
  }

  toggleScreenShare() {
    if (this.isScreenShareActive) {
      if (this.localUsers[0].isScreen()) {
        this.localUsers.unshift(this.userCamDeleted);
        this.initPublisher();
      }
        this.destroyPublisher(1);
        this.localUsers.pop();
        this.localUsers[0].setScreenShareActive(false);
        this.screenActive = 'None';
        this.isScreenShareActive = !this.isScreenShareActive;
        this.localUsers[0].setScreenShareActive(this.isScreenShareActive);
    } else {
      this.initScreenPublisher();
    }
  }

  toggleMic() {
    this.isAudioActive = !this.isAudioActive;
    this.localUsers.forEach((user) => {
      user.setAudioActive(this.isAudioActive);
      (<Publisher>user.getStreamManager()).publishAudio(this.isAudioActive);
    });
  }

  micChanged(label: string) {
    const initPublisherRequired = this.micValue.label !== 'None' && label !== 'None';
    const option = this.microphones.filter((opt: IDevices) => opt.label === label)[0];
    this.micValue = option;
    this.isAudioActive = this.micValue.label === 'None' ? false : true;
    this.localUsers[0].setAudioActive(this.isAudioActive);
    this.localUsers.forEach((user) => {
      (<Publisher>user.getStreamManager()).publishAudio(this.isAudioActive);
    });
    if (initPublisherRequired) {
      this.launchNewPublisher(0);
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
        this.localUsers[0].setUserAvatar(this.randomAvatar);
      }
    }
  }

  takePhoto() {
    this.localUsers[0].setUserAvatar();
    this.videoAvatar = this.localUsers[0].getAvatar();
    this.setAvatar('video');
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
      this.localUsers.forEach((user) => {
        user.getStreamManager().off('streamAudioVolumeChange');
        user.setNickname(this.nicknameFormControl.value);
      });
      if (this.avatarSelected === 'random') {
        this.localUsers[0].removeVideoAvatar();
      }
      if (this.localUsers[1]) {
        this.localUsers[1].setUserAvatar(this.localUsers[0].getAvatar());
      }
      this.join.emit({ localUsers: this.localUsers, sessionId: this.mySessionId });
    }
  }

  toggleDialogExtension() {
    this.showDialogExtension = !this.showDialogExtension;
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
    }).then(publisher => {
      this.subscribeToVolumeChange(publisher);
      this.localUsers[0].setStreamManager(publisher);
      if (this.autopublish) {
        this.accept();
      }
    }).catch((error) => console.error(error));
  }

  private initScreenPublisher() {
    const videoSource = navigator.userAgent.indexOf('Firefox') !== -1 ? 'window' : 'screen';
    const hasAudio = this.localUsers[0].isLocal() && this.localUsers[0].isVideoActive() ? false : this.isAudioActive;
    const publisherProperties = {
      videoSource: videoSource,
      publishAudio: hasAudio,
      publishVideo: true,
      mirror: false,
    };

    this.OV.initPublisherAsync(undefined, publisherProperties )
    .then( (publisher: Publisher ) => {
      this.localUsers.push(new UserModel());
      this.localUsers[1].setStreamManager(publisher);
      this.localUsers[1].setScreenShareActive(true);
      this.localUsers[1].setAudioActive(hasAudio);
      this.localUsers[1].setType('screen');
      this.localUsers[1].setUserAvatar(this.randomAvatar);
      this.isScreenShareActive = !this.isScreenShareActive;
      this.screenActive = 'Screen';
      this.localUsers[0].setScreenShareActive(this.isScreenShareActive);
      if (this.localUsers[0].isLocal() && !this.localUsers[0].isVideoActive()) {
        this.setAudio(true);
        this.destroyPublisher(0);
        this.userCamDeleted = this.localUsers.shift();
        this.subscribeToVolumeChange(publisher);
      }
    }).catch((error) => {
      if (error && error.name === 'SCREEN_EXTENSION_NOT_INSTALLED') {
        this.toggleDialogExtension();
      } else {
        this.apiSrv.handlerScreenShareError(error);
      }
    });
  }

  private launchNewPublisher(index: number) {
    this.destroyPublisher(index);
    this.initPublisher();
  }

  private destroyPublisher(index: number) {
    (<Publisher>this.localUsers[index].getStreamManager()).off('streamAudioVolumeChange');
    this.localUsers[index].getStreamManager().stream.disposeWebRtcPeer();
    this.localUsers[index].getStreamManager().stream.disposeMediaStream();
  }

  private setAudio(value: boolean) {
    this.localUsers[0].setAudioActive(value);
    (<Publisher>(this.localUsers[0].getStreamManager())).publishAudio(value);
  }
}
