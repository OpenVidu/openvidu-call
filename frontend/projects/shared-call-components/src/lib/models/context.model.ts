import { OpenViduMeetPermissions } from 'shared-call-components';

export interface ContextData {
	roomName: string;
	participantName: string;
	token: string;
	participantPermissions: OpenViduMeetPermissions;
	mode: ApplicationMode;
	edition: Edition;
	redirectUrl: string;
	parentDomain: string;
}

export enum ApplicationMode {
	EMBEDDED = 'embedded',
	STANDALONE = 'standalone',
}

export enum Edition {
	CE = 'ce',
	PRO = 'pro'
}
