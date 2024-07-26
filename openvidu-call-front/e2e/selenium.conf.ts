import { Capabilities } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { LAUNCH_MODE } from './config.js';

interface BrowserConfig {
	appUrl: string;
	seleniumAddress: string;
	browserCapabilities: Capabilities;
	browserOptions: chrome.Options;
	browserName: string;
}

const chromeArguments = [
	'--window-size=1024,768',
	'--use-fake-ui-for-media-stream',
	'--use-fake-device-for-media-stream'
];
const chromeArgumentsCI = [
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

const chromeOptions: chrome.Options = new chrome.Options();
chromeOptions.addArguments(...(LAUNCH_MODE === 'CI' ? chromeArgumentsCI : chromeArguments));
export const OpenViduCallConfig: BrowserConfig = {
	appUrl: LAUNCH_MODE === 'CI' ? 'http://localhost:6080/' : 'http://localhost:6080/',
	seleniumAddress: LAUNCH_MODE === 'CI' ? 'http://localhost:3000/webdriver' : '',
	browserName: 'ChromeTest',
	browserCapabilities: Capabilities.chrome().set('acceptInsecureCerts', true),
	browserOptions: chromeOptions
};
