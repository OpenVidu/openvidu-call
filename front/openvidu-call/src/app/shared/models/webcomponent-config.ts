import { OvSettings } from './ov-settings';

export interface ISessionCongif {
  sessionName: string;
  user: string;
  token: string;
  ovSettings: OvSettings;
}
