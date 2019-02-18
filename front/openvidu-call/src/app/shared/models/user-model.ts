import { StreamManager } from 'openvidu-browser';


/**
 * Packs all the information about the user
 */
export class UserModel {
  /**
   * The Connection ID that is publishing the stream
   */
  private connectionId: string;

  /**
   * Whether the user has a audio track active or not
   */
  private audioActive: boolean;

  /**
   * Whether the user has a video track active or not
   */
  private videoActive: boolean;

  /**
   * Whether the user is sharing the screen or not
   */
  private screenShareActive: boolean;

  /**
   * The user nickname
   */
  private nickname: string;

  /**
   * StreamManager object ([[Publisher]] or [[Subscriber]])
   */
  private streamManager: StreamManager;

  /**
   * User type (`local` or  `remote`)
   */
  private type: 'local' | 'remote' | 'screen';

  /**
   * @hidden
   */
  private videoAvatar: HTMLCanvasElement;

  /**
   * @hidden
   */
  private randomAvatar: string;

  /**
   * @hidden
   */
  private localConnectionId: string;

  /**
   * @hidden
   */
  constructor() {
    this.connectionId = '';
    this.audioActive = true;
    this.videoActive = true;
    this.screenShareActive = false;
    this.nickname = '';
    this.streamManager = null;
    this.type = 'local';
  }

  /**
   * Return `true` if audio track is active and `false` if audio track is muted
   */
  public isAudioActive(): boolean {
    return this.audioActive;
  }

  /**
   * Return `true` if video track is active and `false` if video track is muted
   */
  public isVideoActive(): boolean {
    return this.videoActive;
  }

  /**
   * Return `true` if user is sharing the screen and `false` if not
   */
  public isScreenShareActive(): boolean {
    return this.screenShareActive;
  }

  /**
   * Return the connection ID
   */
  public getConnectionId(): string {
    return this.connectionId;
  }

  /**
   * @hidden
   */
  public getLocalConnectionId(): string {
    return this.localConnectionId;
  }

  /**
   * Return the user nickname
   */
  public getNickname(): string {
    return this.nickname;
  }

  /**
   * Return the [[streamManger]] object
   */
  public getStreamManager(): StreamManager {
    return this.streamManager;
  }

  /**
   * Return the user avatar
   */
  public getAvatar(): string {
    return this.videoAvatar ? this.videoAvatar.toDataURL() : this.randomAvatar;
  }

  /**
   * Return `true` if user has a local role and `false` if not
   */
  public isLocal(): boolean {
    return this.type === 'local';
  }

  /**
   * Return `true` if user has a remote role and `false` if not
   */
  public isRemote(): boolean {
    return !this.isLocal();
  }

   /**
   * Return `true` if user has a screen role and `false` if not
   */
  public isScreen(): boolean {
    return this.type === 'screen';
  }

  /**
   * Set the audioActive value
   * @param isAudioActive value of audioActive
   */
  public setAudioActive(isAudioActive: boolean) {
    this.audioActive = isAudioActive;
  }

  /**
   * Set the videoActive value
   * @param isVideoActive value of videoActive
   */
  public setVideoActive(isVideoActive: boolean) {
    this.videoActive = isVideoActive;
  }

  /**
   * Set the screenShare value
   * @param isScreenShareActive value of isScreenShareActive
   */
  public setScreenShareActive(isScreenShareActive: boolean) {
    this.screenShareActive = isScreenShareActive;
  }

  /**
   * Set the streamManager value object
   * @param streamManager value of streamManager
   */
  public setStreamManager(streamManager: StreamManager) {
    this.streamManager = streamManager;
  }

  /**
   * Set the connectionId value
   * @param conecctionId value of connectionId
   */
  public setConnectionId(conecctionId: string) {
    this.connectionId = conecctionId;
  }

  /**
   * @hidden
   */
  public setLocalConnectionId(connectionId: string) {
    this.localConnectionId = connectionId;
  }

  /**
   * Set the user nickname value
   * @param nickname value of user nickname
   */
  public setNickname(nickname: string) {
    this.nickname = nickname;
  }

  /**
   * Set the user type value
   * @param type value of user type
   */
  public setType(type: 'local' | 'remote' | 'screen') {
    this.type = type;
  }

  /**
   * @hidden
   */
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

  public removeVideoAvatar() {
    this.videoAvatar = null;
  }

  /**
   * @hidden
   */
  private createVideoAvatar() {
    this.videoAvatar = document.createElement('canvas');
    this.videoAvatar.className = 'user-img';
    this.videoAvatar.width = 100;
    this.videoAvatar.height = 100;
  }
}
