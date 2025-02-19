import { expect } from 'chai';
import { Builder, WebDriver } from 'selenium-webdriver';
import { OpenViduCallConfig } from './selenium.conf';
import { OpenViduCallPO } from './utils.po';
import * as fs from 'fs';

const APP_URL = OpenViduCallConfig.appUrl;
const downloadDir = OpenViduCallConfig.downloadDir;

describe('Testing Recording Functionality', () => {
	let browser: WebDriver;
	let utils: OpenViduCallPO;
	let randomRoomName = '';

	async function createChromeBrowser(): Promise<WebDriver> {
		return await new Builder()
			.forBrowser(OpenViduCallConfig.browserName)
			.withCapabilities(OpenViduCallConfig.browserCapabilities)
			.setChromeOptions(OpenViduCallConfig.browserOptions)
			.usingServer(OpenViduCallConfig.seleniumAddress)
			.build();
	}

	async function connectStartAndStopRecording(durationMs = 2000) {
		await browser.get(`${APP_URL}/${randomRoomName}`);

		await utils.checkPrejoinIsPresent();
		await utils.joinRoom();

		await utils.checkToolbarIsPresent();

		await utils.startRecordingFromToolbar();

		await browser.sleep(durationMs);

		await utils.stopRecordingFromPanel();
	}

	beforeEach(async () => {
		browser = await createChromeBrowser();
		utils = new OpenViduCallPO(browser);
		randomRoomName = `Room-${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 1000)}`;
	});

	afterEach(async () => {
		await browser.quit();
	});

	it('should be able to record the room', async () => {
		await connectStartAndStopRecording();

		await utils.waitForElement('.recording-item');
		expect(await utils.getNumberOfElements('.recording-item')).equals(1);
	});

	it('should be able to delete a recording', async () => {
		await connectStartAndStopRecording();

		await utils.waitForElement('.recording-item');
		expect(await utils.getNumberOfElements('.recording-item')).equals(1);

		await browser.sleep(2000);

		await utils.deleteRecording();

		await browser.sleep(500);
		expect(await utils.getNumberOfElements('.recording-item')).equals(0);
	});

	it('should be able to play a recording', async () => {
		await connectStartAndStopRecording();

		await utils.waitForElement('.recording-item');
		expect(await utils.getNumberOfElements('.recording-item')).equals(1);

		await browser.sleep(2000);

		await utils.playRecording();

		await browser.sleep(1000);
		await utils.waitForElement('app-recording-dialog');

		await browser.sleep(1000);

		expect(await utils.getNumberOfElements('video')).equals(2);
	});

	it('should be able to download a recording', async () => {
		if (!downloadDir) {
			throw new Error('Download directory is not defined');
		}

		//remove all files from download directory

		fs.readdirSync(downloadDir).forEach((file) => {
			fs.unlinkSync(`${downloadDir}/${file}`);
		});

		await connectStartAndStopRecording();

		await utils.waitForElement('.recording-item');
		expect(await utils.getNumberOfElements('.recording-item')).equals(1);

		await browser.sleep(2000);

		await utils.waitForElement('#download-recording-btn');
		await utils.clickOn('#download-recording-btn');

		await browser.sleep(2000);

		const files = fs.readdirSync(downloadDir);
		const downloadedFile = files.find((file) => file.includes(randomRoomName));

		expect(downloadedFile).to.not.be.undefined;

		if (downloadedFile) {
			const stats = fs.statSync(`${downloadDir}/${downloadedFile}`);
			expect(stats.size).to.be.greaterThan(0, 'El archivo descargado está vacío');
			await utils.checkRecordingFileIsPlayable(`${downloadDir}/${downloadedFile}`);
		} else {
			throw new Error('Downloaded file not found');
		}
	});

	it('should be able to start and stop recording multiple times', async () => {
		await connectStartAndStopRecording();

		await utils.waitForElement('.recording-item');
		await browser.sleep(1000);

		expect(await utils.getNumberOfElements('.recording-item')).equals(1);

		// Second recording
		await utils.startRecordingFromToolbar();
		await browser.sleep(2000);
		await utils.stopRecordingFromPanel();
		await browser.sleep(1000);

		expect(await utils.getNumberOfElements('.recording-item')).equals(2);

		// Third recording
		await utils.startRecordingFromPanel();
		await browser.sleep(2000);
		await utils.stopRecordingFromPanel();
		await browser.sleep(1000);

		expect(await utils.getNumberOfElements('.recording-item')).equals(3);
	});
});
