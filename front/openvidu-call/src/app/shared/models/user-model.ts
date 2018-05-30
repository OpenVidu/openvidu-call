import { Stream } from 'openvidu-browser';

export class UserModel {
  connectionId: string;
  audioMuted: boolean;
  videoMuted: boolean;
  screenShared: boolean;
  nickname: string;
  stream: Stream;

  constructor() {
    this.connectionId = '';
    this.audioMuted = false;
    this.videoMuted = false;
    this.screenShared = false;
    this.nickname = '';
    this.stream = null;
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

  public setAudioMuted(isAudioMuted: boolean) {
    this.audioMuted = isAudioMuted;
  }
  public setVideoMuted(isVideoMuted: boolean) {
    this.videoMuted = isVideoMuted;
  }
  public setScreenShared(isScreenShared: boolean) {
    this.screenShared = isScreenShared;
  }
  public setStream(stream: Stream) {
    this.stream = stream;
  }

  public setConnectionId(conecctionId: string) {
    this.connectionId = conecctionId;
  }
  public setNickname(nickname: string) {
    this.nickname = nickname;
  }
}
