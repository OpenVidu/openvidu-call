import { Capabilities } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { LAUNCH_MODE } from './config';

interface BrowserConfig {
	appUrl: string;
	seleniumAddress: string;
	browserCapabilities: Capabilities;
	browserOptions: chrome.Options;
	browserName: string;
}

let chromeArguments = ['--window-size=1024,768', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'];
let chromeArgumentsCI = [
	'--headless',
	'--disable-dev-shm-usage',
	'--window-size=1024,768',
	'--use-fake-ui-for-media-stream',
	'--use-fake-device-for-media-stream'
];

export const OpenViduCallConfig: BrowserConfig = {
	appUrl: 'http://localhost:4200/#/',
	seleniumAddress: LAUNCH_MODE === 'CI' ? 'http://localhost:4444/wd/hub' : '',
	browserName: 'ChromeTest',
	browserCapabilities: Capabilities.chrome().set('acceptInsecureCerts', true),
	browserOptions: new chrome.Options().addArguments(...(LAUNCH_MODE === 'CI' ? chromeArgumentsCI : chromeArguments))
};
