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
	'--no-sandbox',
	'--disable-gpu',
	'--disable-popup-blocking',
	'--no-first-run',
	'--no-default-browser-check',
	'--disable-dev-shm-usage',
	'--disable-background-networking',
	'--disable-default-apps',
	'--use-fake-ui-for-media-stream',
	'--use-fake-device-for-media-stream'
];

export const OpenViduCallConfig: BrowserConfig = {
	appUrl: LAUNCH_MODE === 'CI' ? 'http://localhost:5000/#/' : 'http://localhost:4200/#/',
	seleniumAddress: LAUNCH_MODE === 'CI' ? 'http://localhost:3000/webdriver' : '',
	browserName: 'ChromeTest',
	browserCapabilities: Capabilities.chrome().set('acceptInsecureCerts', true),
	browserOptions: new chrome.Options().addArguments(...(LAUNCH_MODE === 'CI' ? chromeArgumentsCI : chromeArguments))
};
