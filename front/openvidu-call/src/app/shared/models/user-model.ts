import { StreamManager } from 'openvidu-browser';

export class UserModel {

  private connectionId: string;
  private audioActive: boolean;
  private videoActive: boolean;
  private screenShareActive: boolean;
  private nickname: string;
  private streamManager: StreamManager;
  private type: 'local' | 'remote';
  private videoAvatar: HTMLCanvasElement;
  private randomAvatar: string;

  constructor() {
    this.connectionId = '';
    this.audioActive = true;
    this.videoActive = true;
    this.screenShareActive = false;
    this.nickname = '';
    this.streamManager = null;
    this.type = 'local';
  }

  public isAudioActive(): boolean {
    return this.audioActive;
  }

  public isVideoActive(): boolean {
    return this.videoActive;
  }

  public isScreenShareActive(): boolean {
    return this.screenShareActive;
  }

  public getConnectionId(): string {
    return this.connectionId;
  }

  public getNickname(): string {
    return this.nickname;
  }

  public getStreamManager(): StreamManager {
    return this.streamManager;
  }
  public getAvatar(): string {
    return this.videoAvatar ? this.videoAvatar.toDataURL() : this.randomAvatar;
  }

  public isLocal(): boolean {
    return this.type === 'local';
  }
  public isRemote(): boolean {
    return !this.isLocal();
  }
  public setAudioActive(isAudioActive: boolean) {
    this.audioActive = isAudioActive;
  }
  public setVideoActive(isVideoActive: boolean) {
    this.videoActive = isVideoActive;
  }
  public setScreenShareActive(isScreenShareActive: boolean) {
    this.screenShareActive = isScreenShareActive;
  }
  public setStreamManager(streamManager: StreamManager) {
    this.streamManager = streamManager;
  }

  public setConnectionId(conecctionId: string) {
    this.connectionId = conecctionId;
  }
  public setNickname(nickname: string) {
    this.nickname = nickname;
  }
  public setType(type: 'local' | 'remote') {
    this.type = type;
  }

  public setUserAvatar(img?: string): Promise<any> {
    return new Promise((resolve) => {
      if (!img) {
          this.createVideoAvatar();
          const video = <HTMLVideoElement>document.getElementById('video-' + this.getStreamManager().stream.streamId);
          const avatar = this.videoAvatar.getContext('2d');
          avatar.drawImage(video, 200, 120, 285, 285, 0, 0, 100, 100);
          console.log('Photo was taken: ', this.videoAvatar);
          resolve();
      } else {
        this.randomAvatar = img;
        resolve();
      }
    });
  }

  private createVideoAvatar() {
    this.videoAvatar = document.createElement('canvas');
    this.videoAvatar.className = 'user-img';
    this.videoAvatar.width = 100;
    this.videoAvatar.height = 100;
  }
}
