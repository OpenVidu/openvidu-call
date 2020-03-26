import { Injectable } from '@angular/core';
import { OpenVidu, Device, Publisher } from 'openvidu-browser';
import { IDevice, CameraType } from '../../types/device-type';

@Injectable({
	providedIn: 'root'
})
export class DevicesService {
	private OV: OpenVidu = null;
	private devices: Device[];

	private cameras: IDevice[];
	private microphones: IDevice[];

	private camSelected: IDevice;
	private micSelected: IDevice;

	constructor() {
		this.OV = new OpenVidu();
	}

	async initDevices(publisher: Publisher) {
		console.log('Devices: ', this.devices);
		this.resetDevicesArray();
		const defaultId = publisher.stream
			.getMediaStream()
			.getVideoTracks()[0]
			.getSettings().deviceId;

		this.devices.forEach((device: any) => {
			// Microphones
			if (device.kind === 'audioinput') {
				// Don't add default device
				if (device.deviceId !== 'default') {
					this.microphones.push({ label: device.label, device: device.deviceId });
				}
			}

			// Cameras
			if (device.kind === 'videoinput') {
				const cameraType: CameraType = defaultId === device.deviceId ? CameraType.FRONT : CameraType.BACK;
				const element: IDevice = {
					label: device.label,
					device: device.deviceId,
					type: cameraType
				};
				if (device.deviceId === defaultId) {
					this.camSelected = element;
				}
				this.cameras.push(element);
			}
		});
		this.micSelected = this.getMicSelected();
	}

	getCamSelected(): IDevice {
		// ! TODO: check other way
		return this.camSelected ? this.camSelected : this.cameras[0];
	}

	getMicSelected(): IDevice {
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

	async isWebcamAvailable(): Promise<boolean> {
		this.devices = await this.getDevices();

		const videoDevices = this.devices.filter(device => device.kind === 'videoinput');
		console.log('Is webcam available? ', videoDevices.length > 0);
		return videoDevices.length > 0;
	}

	private getDevices(): Promise<Device[]> {
		return this.OV.getDevices();
	}

	private resetDevicesArray() {
		this.cameras = [{ label: 'None', device: null, type: null }];
		this.microphones = [{ label: 'None', device: null, type: null }];
	}
}
