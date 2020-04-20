import { Injectable } from '@angular/core';
import { OpenVidu, Device, Publisher } from 'openvidu-browser';
import { IDevice, CameraType } from '../../types/device-type';
import { ILogger } from '../../types/logger-type';
import { LoggerService } from '../logger/logger.service';

@Injectable({
	providedIn: 'root'
})
export class DevicesService {
	private OV: OpenVidu = null;
	private devices: Device[] = [];

	private cameras: IDevice[] = [];
	private microphones: IDevice[] = [];

	private camSelected: IDevice;
	private micSelected: IDevice;
	private log: ILogger;

	constructor(private loggerSrv: LoggerService) {
		this.log = this.loggerSrv.get('DevicesService');
		this.OV = new OpenVidu();
	}

	async initDevices() {
		this.devices = await this.getDevices();
		this.devices.length > 0 ? this.log.d('Devices found: ', this.devices) : this.log.w('No devices found!');
		this.resetDevicesArray();
		if (this.hasAudioDeviceAvailable()) {
			this.initAudioDevices();
		}
		if (this.hasVideoDeviceAvailable()) {
			this.initVideoDevices();
			return;
		}
	}

	private initAudioDevices() {
		const audioDevices = this.devices.filter(device => device.kind === 'audioinput');
		audioDevices.forEach((device: any) => {
			// Don't add default device
			if (device.deviceId !== 'default') {
				this.microphones.push({ label: device.label, device: device.deviceId });
			}
		});
		this.micSelected = this.getMicSelected();
	}

	private initVideoDevices() {
		const FIRST_POSITION = 0;
		const videoDevices = this.devices.filter(device => device.kind === 'videoinput');
		videoDevices.forEach((device: any, index: number) => {
			const element: IDevice = {
				label: device.label,
				device: device.deviceId,
				type:  CameraType.BACK
			};
			// We assume first device is front camera
			if (index === FIRST_POSITION) {
				element.type = CameraType.FRONT;
				this.camSelected = element;
			}
			this.cameras.push(element);
		});
	}

	getCamSelected(): IDevice {
		if (this.cameras.length === 0) {
			this.log.w('No video devices found!');
			return;
		}
		// ! TODO: check other way
		return this.camSelected ? this.camSelected : this.cameras[0];
	}

	getMicSelected(): IDevice {
		if (this.microphones.length === 0) {
			this.log.w('No audio devices found!');
			return;
		}
		// ! TODO: check other way
		return this.microphones[1] ? this.microphones[1] : this.microphones[0];
	}

	setCamSelected(videoSource: any) {
		this.camSelected = this.getCameraByVideoSource(videoSource);
	}

	setMicSelected(audioSource: any) {
		this.camSelected = this.getMicrophoneByAudioSource(audioSource);
	}

	deviceHasValue(deviceId): boolean {
		return !!deviceId;
	}

	needUpdateVideoTrack(newVideoSource: string): boolean {
		return this.camSelected.device !== newVideoSource;
	}

	needUpdateAudioTrack(newAudioSource: string): boolean {
		return this.micSelected.device !== newAudioSource;
	}

	getCameraByVideoSource(videoSource: any): IDevice {
		return this.cameras.filter((opt: IDevice) => opt.device === videoSource)[0];
	}

	getMicrophoneByAudioSource(audioSource: any): IDevice {
		return this.microphones.filter((opt: IDevice) => opt.device === audioSource)[0];
	}

	getCameras(): IDevice[] {
		return this.cameras;
	}

	getMicrophones(): IDevice[] {
		return this.microphones;
	}

	hasVideoDeviceAvailable(): boolean {
		const videoDevices = this.devices?.filter(device => device.kind === 'videoinput');
		return videoDevices?.length > 0;
	}

	hasAudioDeviceAvailable(): boolean {
		const audioDevice = this.devices?.filter(device => device.kind === 'audioinput');
		return audioDevice?.length > 0;
	}

	cameraNeedsMirror(VideoSource: string): boolean {
		return this.getCameraByVideoSource(VideoSource).type === CameraType.FRONT;
	}

	private async getDevices(): Promise<Device[]> {
		try {
			// Wait until media devices permissions are accepted or rejected
			const mediaStream = await this.OV.getUserMedia({audioSource: undefined, videoSource: undefined});
			mediaStream.getTracks().forEach((track) => track.stop());
			return this.OV.getDevices();
		} catch (e) {
			e.name === 'DEVICE_ACCESS_DENIED' ? this.log.e(e.name + ': Access to media devices was not allowed') : this.log.e(e);
			return [];
		}
	}

	private resetDevicesArray() {
		this.cameras = [{ label: 'None', device: null, type: null }];
		this.microphones = [{ label: 'None', device: null, type: null }];
	}
}
