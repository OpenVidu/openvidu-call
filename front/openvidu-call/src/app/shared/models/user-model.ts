import { Stream, StreamManager } from 'openvidu-browser';

export class UserModel {
  connectionId: string;
  audioMuted: boolean;
  videoMuted: boolean;
  screenShared: boolean;
  nickname: string;
  streamManager: StreamManager;
  type: 'local' | 'remote';

  constructor() {
    this.connectionId = '';
    this.audioMuted = false;
    this.videoMuted = false;
    this.screenShared = false;
    this.nickname = '';
    this.streamManager = null;
    this.type = 'local';
  }

  public isAudioMuted(): boolean {
    return this.audioMuted;
  }

  public isVideoMuted(): boolean {
    return this.videoMuted;
  }

  public isScreenShared(): boolean {
    return this.screenShared;
  }

  public getConnectionId(): string {
    return this.connectionId;
  }

  public getNickname(): string {
    return this.nickname;
  }

  public isLocal(): boolean {
    return this.type === 'local';
  }
  public isRemote(): boolean {
    return !this.isLocal();
  }
  public setAudioMuted(isAudioMuted: boolean) {
    this.audioMuted = isAudioMuted;
  }
  public setVideoMuted(isVideoMuted: boolean) {
    this.videoMuted = isVideoMuted;
  }
  public setScreenShared(isScreenShared: boolean) {
    this.screenShared = isScreenShared;
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
}
