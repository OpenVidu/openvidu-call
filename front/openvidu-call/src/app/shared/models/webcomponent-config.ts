import { OvSettings } from './ov-settings';

export interface ISessionCongif {
  sessionName: string;
  user: string;
  tokens: string[];
  ovSettings: OvSettings;
}
