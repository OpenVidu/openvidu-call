import { Capabilities } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome.js';
import { APP_URL, LAUNCH_MODE } from './config';
import * as fs from 'fs';

interface BrowserConfig {
	appUrl: string;
	seleniumAddress: string;
	browserCapabilities: Capabilities;
	browserOptions: chrome.Options;
	browserName: string;
	downloadDir?: string;
}

const chromeArguments = [
	'--window-size=1024,768',
	'--use-fake-ui-for-media-stream',
	'--use-fake-device-for-media-stream'
];
const chromeArgumentsCI = [
	'--window-size=1300,1000',
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
const downloadPath = '/tmp/downloads';

const chromeOptions: chrome.Options = new chrome.Options();
chromeOptions.addArguments(...(LAUNCH_MODE === 'CI' ? chromeArgumentsCI : chromeArguments));

if (LAUNCH_MODE === 'CI') {
	chromeOptions.setUserPreferences({
		'download.default_directory': '/tmp/downloads',
		'download.prompt_for_download': false,
		'download.directory_upgrade': true,
		'safebrowsing.enabled': true
	});
}

export const OpenViduCallConfig: BrowserConfig = {
	appUrl: APP_URL,
	seleniumAddress: LAUNCH_MODE === 'CI' ? 'http://localhost:4444/wd/hub' : '',
	browserName: 'ChromeTest',
	browserCapabilities: Capabilities.chrome().set('acceptInsecureCerts', true),
	browserOptions: chromeOptions,
	downloadDir: downloadPath
};
