export interface IDevice {
	label: string;
	device: string;
	type?: CameraType;
}

export enum CameraType {
	FRONT = 'FRONT',
	BACK = 'BACK'
}
