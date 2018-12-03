import { StreamManager } from 'openvidu-browser';

export class UserModel {
  private connectionId: string;
  private audioActive: boolean;
  private videoActive: boolean;
  private screenShareActive: boolean;
  private nickname: string;
  private streamManager: StreamManager;
  private type: 'local' | 'remote';
  private avatar: HTMLCanvasElement;
  private role: 'SUBSCRIBER' | 'PUBLISHER';

  constructor() {
    this.connectionId = '';
    this.audioActive = true;
    this.videoActive = true;
    this.screenShareActive = false;
    this.nickname = '';
    this.streamManager = null;
    this.type = 'local';
    this.createAvatar();
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
    return this.avatar.toDataURL();
  }

  public getRole(): string {
    return this.role;
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
  public setRole(role: 'SUBSCRIBER' | 'PUBLISHER'): void {
    this.role = role;
    if (role === 'SUBSCRIBER') {
      this.setAudioActive(false);
      this.setVideoActive(false);
    }
  }

  public setUserAvatar(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const video = <HTMLVideoElement>document.getElementById('video-' + this.getStreamManager().stream.streamId);
        const avatar = this.avatar.getContext('2d');
        avatar.drawImage(video, 200, 120, 285, 285, 0, 0, 60, 60);
        console.log('Photo was taken: ', this.avatar);
        resolve();
      }, 2000);
    });
  }

  private createAvatar() {
    this.avatar = document.createElement('canvas');
    this.avatar.className = 'user-img';
    this.avatar.width = 60;
    this.avatar.height = 60;
  }
}
