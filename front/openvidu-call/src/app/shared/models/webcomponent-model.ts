import { OvSettings } from '../types/ov-settings';
import { ISessionConfig, Theme } from '../types/webcomponent-config';

export class WebComponentModel {
	private ovSettings: OvSettings;
	private sessionConfig: ISessionConfig;

	private sessionName: string;
	private ovServerUrl: string;
	private ovSecret: string;
	private theme = Theme.DARK;
	private nickname: string;
	private tokens: string[];

	constructor() {
		this.ovSettings = {
			chat: true,
			autopublish: false,
			toolbarButtons: {
				video: true,
				audio: true,
				fullscreen: true,
				screenShare: true,
				exit: true
			}
		};
	}

	canJoinToSession(): boolean {
		return this.canOVCallGenerateToken() || this.hasReceivedToken();
	}

	setSessionConfig(config: any) {
		if (typeof config === 'string') {
			this.sessionConfig = JSON.parse(config);
		} else {
			this.sessionConfig = config;
		}

		if (!!this.sessionConfig) {
			this.sessionName = this.sessionConfig.sessionName;
			this.nickname = this.sessionConfig.user;
			this.tokens = this.sessionConfig.tokens;
			if (this.sessionConfig.ovSettings && this.isOvSettingsType(this.sessionConfig.ovSettings)) {
				this.ovSettings = this.sessionConfig.ovSettings;
				this.ovSettings.toolbarButtons.screenShare = this.tokens?.length > 1;
			}
			// Allow screen sharing only if two tokens are received
			console.warn('Screen share funcionality has been disabled. OpenVidu Angular has received only one token.');
			this.ovSettings.toolbarButtons.screenShare = this.tokens?.length > 1;
		}
	}

	setTheme(theme: string) {
		if ((<any>Object).values(Theme).includes(theme)) {
			this.theme = theme === Theme.DARK ? Theme.DARK : Theme.LIGHT;
		}
	}

	setOvServerUrl(url: string) {
		this.ovServerUrl = url;
	}

	setOvSecret(secret: string) {
		this.ovSecret = secret;
	}

	getTheme(): Theme {
		return this.theme;
	}

	getScreenToken(): string {
		return this.tokens[1];
	}
	getWebcamToken(): string {
		return this.tokens[0];
	}
	hasTokens(): boolean {
		return this.tokens?.length === 2;
	}
	getOvSettings(): OvSettings {
		return this.ovSettings;
	}
	getNickname(): string {
		return this.nickname;
	}

	getSessionName(): string {
		return this.sessionName;
	}

	getOvSecret(): string {
		return this.ovSecret;
	}
	getOvUrl(): string {
		return this.ovServerUrl;
	}

	isAutoConnect(): boolean {
		return this.ovSettings.autopublish;
	}

	private canOVCallGenerateToken(): boolean {
		console.log("sessionName", this.sessionName);
		console.log("ovServerUrl", this.ovServerUrl);
		console.log("ovSecret", this.ovSecret);
		console.log("nickname", this.nickname);
		return !!this.sessionName && !!this.ovServerUrl && !!this.ovSecret && !!this.nickname;
	}
	private hasReceivedToken(): boolean {
		console.log("tokens", this.tokens);
		console.log("nickname", this.nickname);

		return !!this.tokens && this.tokens.length > 0 && !!this.nickname;
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
			'exit' in obj.toolbarButtons &&
			typeof obj.toolbarButtons['exit'] === 'boolean'
		);
	}
}
