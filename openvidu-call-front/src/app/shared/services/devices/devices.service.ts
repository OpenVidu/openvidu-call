import { Injectable } from '@angular/core';
import { OpenVidu, Device } from 'openvidu-browser';
import { IDevice, CameraType } from '../../types/device-type';
import { ILogger } from '../../types/logger-type';
import { LoggerService } from '../logger/logger.service';
import { UtilsService } from '../utils/utils.service';

@Injectable({
	providedIn: 'root'
})
export class DevicesService {
	private OV: OpenVidu = null;
	private devices: Device[];
	private cameras: IDevice[] = [];
	private microphones: IDevice[] = [];
	private camSelected: IDevice;
	private micSelected: IDevice;
	private log: ILogger;

	constructor(private loggerSrv: LoggerService, private utilSrv: UtilsService) {
		this.log = this.loggerSrv.get('DevicesService');
		this.OV = new OpenVidu();
	}

	async initDevices() {
		this.devices = await this.OV.getDevices();
		this.devices.length > 0 ? this.log.d('Devices found: ', this.devices) : this.log.w('No devices found!');
		this.resetDevicesArray();
		if (this.hasAudioDeviceAvailable()) {
			this.initAudioDevices();
		}
		if (this.hasVideoDeviceAvailable()) {
			this.initVideoDevices();
		}
	}

	private initAudioDevices() {
		const audioDevices = this.devices.filter((device) => device.kind === 'audioinput');
		audioDevices.forEach((device: Device) => {
			this.microphones.push({ label: device.label, device: device.deviceId });
		});
		this.micSelected = this.getMicSelected();
	}

	private initVideoDevices() {
		const FIRST_POSITION = 0;
		const videoDevices = this.devices.filter((device) => device.kind === 'videoinput');
		videoDevices.forEach((device: Device, index: number) => {
			const myDevice: IDevice = {
				label: device.label,
				device: device.deviceId,
				type: CameraType.BACK
			};
			if (this.utilSrv.isMobile()) {
				// We assume front video device has 'front' in its label in Mobile devices
				if (myDevice.label.toLowerCase().includes(CameraType.FRONT.toLowerCase())) {
					myDevice.type = CameraType.FRONT;
					this.camSelected = myDevice;
				}
			} else {
				// We assume first device is web camera in Browser Desktop
				if (index === FIRST_POSITION) {
					myDevice.type = CameraType.FRONT;
					this.camSelected = myDevice;
				}
			}

			this.cameras.push(myDevice);
		});
		this.log.d('Camera selected', this.camSelected);
	}

	getCamSelected(): IDevice {
		if (this.cameras.length === 0) {
			this.log.w('No video devices found!');
			return;
		}
		return this.camSelected || this.cameras[0];
	}

	getMicSelected(): IDevice {
		if (this.microphones.length === 0) {
			this.log.w('No audio devices found!');
			return;
		}
		return this.micSelected || this.microphones[0];
	}

	setCamSelected(deviceField: any) {
		this.camSelected = this.getCameraByDeviceField(deviceField);
	}

	setMicSelected(deviceField: any) {
		this.micSelected = this.getMicrophoneByDeviceField(deviceField);
	}

	needUpdateVideoTrack(newVideoSource: string): boolean {
		return this.camSelected.device !== newVideoSource;
	}

	needUpdateAudioTrack(newAudioSource: string): boolean {
		return this.micSelected.device !== newAudioSource;
	}

	getCameras(): IDevice[] {
		return this.cameras;
	}

	getMicrophones(): IDevice[] {
		return this.microphones;
	}

	hasVideoDeviceAvailable(): boolean {
		return !!this.devices?.find((device) => device.kind === 'videoinput');
	}

	hasAudioDeviceAvailable(): boolean {
		return !!this.devices?.find((device) => device.kind === 'audioinput');
	}

	cameraNeedsMirror(deviceField: string): boolean {
		return this.getCameraByDeviceField(deviceField)?.type === CameraType.FRONT;
	}

	private getCameraByDeviceField(deviceField: any): IDevice {
		return this.cameras.find((opt: IDevice) => opt.device === deviceField || opt.label === deviceField);
	}

	private getMicrophoneByDeviceField(deviceField: any): IDevice {
		return this.microphones.find((opt: IDevice) => opt.device === deviceField || opt.label === deviceField);
	}

	private resetDevicesArray() {
		this.cameras = [{ label: 'None', device: null, type: null }];
		this.microphones = [{ label: 'None', device: null, type: null }];
	}
}
