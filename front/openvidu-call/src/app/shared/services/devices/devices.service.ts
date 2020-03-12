import { Injectable } from '@angular/core';
import { OpenVidu, Device, Publisher } from 'openvidu-browser';
import { IDevice, CameraType } from '../../models/device-type';

@Injectable({
	providedIn: 'root'
})
export class DevicesService {
	private OV: OpenVidu = null;

	private cameras: IDevice[] = [{ label: 'None', device: null, type: null }];
	private microphones: IDevice[] = [{ label: 'None', device: null, type: null }];

	private camSelected: IDevice;

	constructor() {
		this.OV = new OpenVidu();
	}

	async initDevices(publisher: Publisher) {
		const devices: Device[] = await this.getDevices();
		console.log('Devices: ', devices);

		const defaultId = publisher.stream
			.getMediaStream()
			.getVideoTracks()[0]
			.getSettings().deviceId;

		devices.forEach((device: any) => {
			// Microphones
			if (device.kind === 'audioinput') {
				this.microphones.push({ label: device.label, device: device.deviceId });
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
	}

	getCamSelected(): IDevice {
		// ! TODO: check other way
		return this.camSelected ? this.camSelected : this.cameras[0];
	}

	getMicSelected(): IDevice {
		// ! TODO: check other way
		return this.microphones[1] ? this.microphones[1] : this.microphones[0];
	}

	getCameras(): IDevice[] {
		return this.cameras;
	}

	getMicrophones(): IDevice[] {
		return this.microphones;
	}

	private getDevices(): Promise<Device[]> {
		return this.OV.getDevices();
	}
}
