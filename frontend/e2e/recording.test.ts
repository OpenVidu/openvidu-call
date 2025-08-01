import { expect } from 'chai';
import { Builder, Key, WebDriver } from 'selenium-webdriver';
import { OpenViduCallConfig } from './selenium.conf';
import { OpenViduCallPO } from './utils.po.test';
import fs from 'fs';

const url = OpenViduCallConfig.appUrl;

describe('Testing recordings', () => {
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

	async function connectStartAndStopRecording(roomName: string = randomRoomName): Promise<void> {
		await browser.get(`${url}${roomName}`);

		await utils.checkPrejoinIsPresent();
		await utils.joinSession();

		await utils.checkToolbarIsPresent();

		await utils.startRecordingFromToolbar();
		await utils.checkRecordingIsStarting();
		await utils.checkRecordingIsStarted();

		await browser.sleep(5000);

		await utils.stopRecordingFromPanel();
		await utils.checkRecordingIsStopped();
	}

	async function expectRecordingToBePresent(): Promise<void> {
		await utils.waitForElement('.recording-card');
		expect(await utils.getNumberOfElements('.recording-card')).equals(1);
	}

	async function expectRecordingToBeDeleted(): Promise<void> {
		// Get a fresh reference to the recording item
		await utils.waitForElement('.recording-card');

		// Delete the recording
		await utils.deleteRecording();

		// Wait for the deletion to take effect (using a negative wait)
		await browser.sleep(2000);

		// Verify the recording is no longer present
		expect(await utils.getNumberOfElements('.recording-card')).equals(0);
	}

	async function expectRecordingToBePlayed(): Promise<void> {
		await utils.playRecording();

		await browser.sleep(2000);
		await utils.waitForElement('app-recording-dialog');

		await browser.sleep(1000);

		expect(await utils.getNumberOfElements('video')).equals(2);

		// click outside the dialog to close it
		await browser.actions().keyDown(Key.ESCAPE).perform();
		await browser.sleep(1000);
	}

	async function expectRecordingToBeDownloaded(): Promise<void> {
		await utils.downloadRecording();
		await browser.sleep(1000);
		expect(await utils.getNumberOfElements('app-recording-dialog')).equals(0);

		// Check if the file is downloaded
		const downloadsDir = OpenViduCallConfig.downloadsDir;
		const files = fs.readdirSync(downloadsDir);
		const downloadedFile = files.find((file) => file.includes('Room-') && file.endsWith('.mp4'));

		if (!downloadedFile) {
			throw new Error('Recording file not found in downloads directory ' + downloadsDir);
		}

		expect(downloadedFile).to.exist;

		// check if the recording can be played
		const filePath = `${downloadsDir}/${downloadedFile}`;

		const stats = fs.statSync(filePath);
		expect(stats.isFile()).to.be.true;
		expect(stats.size).to.be.greaterThan(0);

		// Clean up the downloaded file
		fs.unlinkSync(filePath);
	}

	beforeEach(async () => {
		browser = await createChromeBrowser();
		utils = new OpenViduCallPO(browser);
		randomRoomName = `Room-${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 1000)}`;
	});

	afterEach(async () => {
		try {
			await utils.leaveRoom();
		} catch (error) {
			// Ignore errors when leaving the room
		}

		await browser.quit();
	});

	it('should be able to start, stop, play, download and delete a recording', async () => {
		try {
			await connectStartAndStopRecording();

			await expectRecordingToBePresent();

			await expectRecordingToBePlayed();

			await expectRecordingToBeDownloaded();

			await expectRecordingToBeDeleted();
		} catch (error) {
			const screenshot = await browser.takeScreenshot();
			console.log(`data:image/png;base64,${screenshot}`);
			throw error;
		}
	});
});
