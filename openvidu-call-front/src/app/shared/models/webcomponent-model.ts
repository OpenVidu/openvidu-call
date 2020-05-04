import { ISessionConfig } from '../types/webcomponent-config';
import { ExternalConfigModel } from './external-config';

export class WebComponentModel extends ExternalConfigModel {
	private readonly NAME = 'WebComponent';
	private sessionConfig: ISessionConfig;

	constructor() {
		super();
	}

	setSessionConfig(config: any) {

		this.sessionConfig = config;

		if (!!this.sessionConfig) {
			this.sessionName = this.sessionConfig.sessionName;
			this.nickname = this.sessionConfig.user;
			this.tokens = this.sessionConfig.tokens;
			if (this.sessionConfig.ovSettings && this.isOvSettingsType(this.sessionConfig.ovSettings)) {
				this.ovSettings.set(this.sessionConfig.ovSettings);
			}
			// Allow screen sharing only if two tokens are received
			this.ovSettings.setScreenSharing(this.ovSettings.hasScreenSharing() && this.tokens?.length > 1);
			if (!this.ovSettings.hasScreenSharing()) {
				console.warn('ScreenSharing has been disabled. OpenVidu Angular has received only one token.');
			}
		}
	}
	public getComponentName() {
		return this.NAME;
	}

	private isOvSettingsType(obj) {
		return (
			'chat' in obj &&
			typeof obj['chat'] === 'boolean' &&
			'autopublish' in obj &&
			typeof obj['autopublish'] === 'boolean' &&
			'toolbarButtons' in obj &&
			typeof obj['toolbarButtons'] === 'object' &&
			'audio' in obj.toolbarButtons &&
			typeof obj.toolbarButtons['audio'] === 'boolean' &&
			'audio' in obj.toolbarButtons &&
			typeof obj.toolbarButtons['audio'] === 'boolean' &&
			'video' in obj.toolbarButtons &&
			typeof obj.toolbarButtons['video'] === 'boolean' &&
			'screenShare' in obj.toolbarButtons &&
			typeof obj.toolbarButtons['screenShare'] === 'boolean' &&
			'fullscreen' in obj.toolbarButtons &&
			typeof obj.toolbarButtons['fullscreen'] === 'boolean' &&
			'layoutSpeaking' in obj.toolbarButtons &&
			typeof obj.toolbarButtons['layoutSpeaking'] === 'boolean' &&
			'exit' in obj.toolbarButtons &&
			typeof obj.toolbarButtons['exit'] === 'boolean'
		);
	}
}
