import { Stream } from 'openvidu-browser';

export class UserModel {
  connectionId: string;
  audioMuted: boolean;
  videoMuted: boolean;
  nickname: string;
  stream: Stream;

  constructor() {
    this.connectionId = '';
    this.audioMuted = false;
    this.videoMuted = false;
    this.nickname = '';
    this.stream = null;
  }

  public isAudioMuted(): boolean {
    return this.audioMuted;
  }

  public isVideoMuted(): boolean {
    return this.videoMuted;
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
