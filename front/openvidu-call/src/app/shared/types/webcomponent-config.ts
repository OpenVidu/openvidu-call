import { OvSettings } from '../types/ov-settings';

export interface ISessionCongif {
	sessionName: string;
	user: string;
	tokens: string[];
	ovSettings: OvSettings;
}
