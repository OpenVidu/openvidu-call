import { Publisher, PublisherProperties, Connection } from 'openvidu-browser';
import { Signal } from '../../types/singal-type';

export interface IOpenViduWebRTC {

	initPublisher(targetElement: string | HTMLElement, properties: PublisherProperties): Publisher;
	initPublisherAsync(targetElement: string | HTMLElement, properties: PublisherProperties): Promise<Publisher>;

	initializeWebcamSession(): void;

	initializeScreenSession(): void;

	connectWebcamSession(token: string): Promise<any>;

	disconnectWebcamSession(): void;

	connectScreenSession(token: string): Promise<any>;

	disconnectScreenSession(): void;

	destroyWebcamPublisher(): void;

	destroyScreenPublisher(): void;

	publishWebcamPublisher(): Promise<any>;

	unpublishWebcamPublisher(): void;

	publishScreenPublisher(): Promise<any>;

	unpublishScreenPublisher(): void;

	publishWebcamVideo(active: boolean): void;

	publishWebcamAudio(active: boolean): void;

	publishScreenAudio(active: boolean): void;

	replaceTrack(videoSource: string, audioSource: string, mirror: boolean): Promise<any>;

	sendSignal(type: Signal, connection?: Connection, data?: any): void;

	createPublisherProperties(
		videoSource: string | MediaStreamTrack | boolean,
		audioSource: string | MediaStreamTrack | boolean,
		publishVideo: boolean,
		publishAudio: boolean,
		mirror: boolean
	): PublisherProperties;

	stopVideoTracks(mediaStream: MediaStream): void;
	stopAudioTracks(mediaStream: MediaStream): void;
}
