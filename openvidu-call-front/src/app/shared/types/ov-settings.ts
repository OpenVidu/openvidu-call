export interface OvSettings {
	chat: boolean;
	autopublish: boolean;
	toolbar: boolean;
	footer: boolean;
	toolbarButtons: {
		audio: boolean;
		video: boolean;
		screenShare: boolean;
		fullscreen: boolean;
		layoutSpeaking: boolean;
		exit: boolean;
	};
}
