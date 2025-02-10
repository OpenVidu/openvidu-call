export interface ContextData {
	roomName: string;
	participantName: string;
	token: string;
	decodedToken: any;
	mode: ApplicationMode;
	edition: Edition
}

export enum ApplicationMode {
	EMBEDDED = 'embedded',
	STANDALONE = 'standalone',
	STANDALONE_WITH_TOKEN = 'standalone_with_token'
}

export enum Edition {
	CE = 'ce',
	PRO = 'pro'
}
