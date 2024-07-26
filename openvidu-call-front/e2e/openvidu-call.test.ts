import { expect } from 'chai';
import { Builder, WebDriver, WebElement } from 'selenium-webdriver';
import { OpenViduCallConfig } from './selenium.conf';
import { OpenViduCallPO } from './utils.po.test';
import * as fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const url = OpenViduCallConfig.appUrl;

describe('Smoke test for OpenVidu Call ', () => {
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

	beforeEach(async () => {
		browser = await createChromeBrowser();
		utils = new OpenViduCallPO(browser);
		randomRoomName = `Room-${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 1000)}`;
	});

	afterEach(async () => {
		await browser.quit();
	});

	async function saveScreenshot(filename: string, element: WebElement) {
		const image = await element.takeScreenshot();
		fs.writeFileSync(filename, image, 'base64');
	}

	it('should show ONLY the ROOM NAME input', async () => {
		await browser.get(url);

		expect(await utils.isPresent('#login-username')).to.be.false;

		expect(await utils.isPresent('#login-password')).to.be.false;

		await utils.waitForElement('#room-name-input');
		expect(await utils.isPresent('#room-name-input')).to.be.true;

		const button = await utils.waitForElement('#join-btn');
		expect(await utils.isPresent('#join-btn')).to.be.true;
		expect(await button.isEnabled()).to.be.true;
	});

	it('should generate a random room name', async () => {
		await browser.get(`${url}`);

		const element = await utils.waitForElement('#room-name-input');
		expect(await utils.isPresent('#room-name-input')).to.be.true;

		const roomName = await element.getAttribute('value');

		await utils.clickOn('#room-name-generator-btn');

		expect(await element.getAttribute('value')).to.not.equal(roomName);
	});

	it('should show the prejoin page after inserting a room name', async () => {
		await browser.get(`${url}${randomRoomName}`);

		await utils.checkPrejoinIsPresent();
	});

	it('should show the toolbar and media buttons', async () => {
		await browser.get(`${url}${randomRoomName}`);

		await utils.checkPrejoinIsPresent();
		await utils.joinSession();

		await utils.checkToolbarIsPresent();
	});

	it('should show error trying to join a room with the same name', async () => {
		const fixedUrl = `${url}${randomRoomName}`;
		await browser.get(fixedUrl);

		await utils.checkPrejoinIsPresent();
		await utils.joinSession();

		await utils.checkToolbarIsPresent();

		const tabs = await utils.openTab(fixedUrl);
		await browser.switchTo().window(tabs[1]);

		await utils.checkPrejoinIsPresent();
		await utils.joinSession();

		await utils.waitForElement('.error');
		expect(await utils.isPresent('.error')).to.be.true;
	});

	it('should start a videoconference and display the video elements', async () => {
		const fixedUrl = `${url}${randomRoomName}`;
		await browser.get(fixedUrl);

		await utils.checkPrejoinIsPresent();

		await utils.joinSession();

		await utils.waitForElement('#local-element-camera');
		const localVideo = await utils.waitForElement('.OV_video-element');
		expect(await utils.isPresent('#local-element-camera')).to.be.true;
		expect(await localVideo.isDisplayed()).to.be.true;

		const tabs = await utils.openTab(fixedUrl);

		await browser.switchTo().window(tabs[1]);
		await utils.checkPrejoinIsPresent();
		await utils.sendKeys('#name-input', 'participant2');
		await utils.joinSession();

		// check if second tab received the remote video
		await utils.waitForElement('#local-element-camera');
		await utils.waitForElement('.OV_video-element');
		await utils.waitForElement('.remote-participant');
		expect(await utils.isPresent('.remote-participant')).to.be.true;
		expect(await utils.isPresent('#local-element-camera')).to.be.true;

		// check if first tab received the remote vide
		await browser.switchTo().window(tabs[0]);
		await utils.waitForElement('.remote-participant');
		expect(await utils.isPresent('.remote-participant')).to.be.true;
	});

	it('should show the chat and send a message', async () => {
		await browser.get(`${url}${randomRoomName}`);

		await utils.checkPrejoinIsPresent();
		await utils.joinSession();

		await utils.waitForElement('#chat-panel-btn');
		await utils.clickOn('#chat-panel-btn');

		await browser.sleep(1000);
		await utils.waitForElement('#chat-input');
		await utils.sendKeys('#chat-input', 'Hello world');
		await utils.clickOn('#send-btn');

		await utils.waitForElement('.chat-message');
		expect(await utils.isPresent('.chat-message')).to.be.true;
	});

	it('should show the activities panel', async () => {
		await browser.get(`${url}${randomRoomName}`);

		await utils.checkPrejoinIsPresent();
		await utils.joinSession();

		await utils.waitForElement('#activities-panel-btn');
		await utils.clickOn('#activities-panel-btn');

		await utils.waitForElement('ov-activities-panel');
		expect(await utils.isPresent('ov-activities-panel')).to.be.true;
	});

	it('should apply a virtual background', async () => {
		await browser.get(`${url}${randomRoomName}`);

		await utils.checkPrejoinIsPresent();
		await utils.joinSession();

		await utils.checkToolbarIsPresent();

		let localVideo = await utils.waitForElement('.OV_video-element');

		await saveScreenshot('before.png', localVideo);

		// check if the virtual background is applied

		await utils.applyVirtualBackground('2');

		localVideo = await utils.waitForElement('.OV_video-element');
		await saveScreenshot('after.png', localVideo);

		const img1 = PNG.sync.read(fs.readFileSync('before.png'));
		const img2 = PNG.sync.read(fs.readFileSync('after.png'));
		const { width, height } = img1;
		const diff = new PNG({ width, height });

		const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
			threshold: 0.4
			// alpha: 0.5,
			// includeAA: false,
			// diffColor: [255, 0, 0]
		});
		fs.writeFileSync('diff.png', PNG.sync.write(diff));
		expect(numDiffPixels).to.be.greaterThan(500, 'The virtual background was not applied correctly');
	});
});

// describe('Testing MODERATOR ACCESS features', () => {
// 	let browser: WebDriver;
// 	let incognitoBrowser: WebDriver;
// 	let utils: OpenViduCallPO;

// 	async function createChromeBrowser(incognito = false): Promise<WebDriver> {
// 		const browser = new Builder()
// 			.forBrowser(OpenViduCallConfig.browserName)
// 			.withCapabilities(OpenViduCallConfig.browserCapabilities)
// 			.setChromeOptions(OpenViduCallConfig.browserOptions)
// 			.usingServer(OpenViduCallConfig.seleniumAddress);

// 		if (incognito) {
// 			const chromeOptions = browser.getChromeOptions();
// 			chromeOptions.addArguments('--incognito');
// 			browser.setChromeOptions(chromeOptions);
// 		}

// 		return await browser.build();
// 	}

// 	beforeEach(async () => {
// 		browser = await createChromeBrowser();
// 		utils = new OpenViduCallPO(browser);
// 	});

// 	afterEach(async () => {
// 		await browser.quit();
// 	});

// 	it('MODERATOR should have access to BROADCASTING feature', async () => {
// 		await browser.get(url);

// 		await utils.waitForElement('#join-btn');
// 		await utils.clickOn('#join-btn');

// 		await utils.waitForElement('#join-button');
// 		await utils.clickOn('#join-button');

// 		await utils.checkToolbarIsPresent();
// 		await utils.clickOn('#activities-panel-btn');

// 		await utils.waitForElement('ov-broadcasting-activity');
// 		await utils.clickOn('ov-broadcasting-activity');

// 		await utils.waitForElement('#broadcasting-url-input');
// 		expect(await utils.isPresent('not-allowed-message')).to.be.false;
// 	});

// 	it('PUBLISHER should not access to BROADCASTING feature', async () => {
// 		await browser.get(`${url}broadcastingSession`);

// 		await utils.waitForElement('#join-button');
// 		await utils.clickOn('#join-button');

// 		await utils.checkToolbarIsPresent();
// 		await utils.clickOn('#activities-panel-btn');

// 		await utils.waitForElement('ov-broadcasting-activity');
// 		await utils.clickOn('ov-broadcasting-activity');

// 		await utils.waitForElement('#broadcasting-url-input');
// 		expect(await utils.isPresent('.not-allowed-message')).to.be.false;

// 		incognitoBrowser = await createChromeBrowser(true);
// 		const incognitoUtils = new OpenViduCallPO(incognitoBrowser);

// 		await incognitoBrowser.get(`${url}broadcastingSession`);

// 		await incognitoUtils.waitForElement('#join-button');
// 		await incognitoUtils.clickOn('#join-button');

// 		await incognitoUtils.checkToolbarIsPresent();
// 		await incognitoUtils.clickOn('#activities-panel-btn');

// 		await incognitoUtils.waitForElement('ov-broadcasting-activity');
// 		await incognitoUtils.clickOn('ov-broadcasting-activity');

// 		await incognitoUtils.waitForElement('.not-allowed-message');
// 		expect(await incognitoUtils.isPresent('#broadcasting-url-input')).to.be.false;
// 		await incognitoBrowser.quit();
// 	});

// 	it('MODERATOR should have access to RECORDING feature', async () => {
// 		await browser.get(url);

// 		const button = await utils.waitForElement('#join-btn');
// 		expect(await utils.isPresent('#join-btn')).to.be.true;
// 		expect(await button.isEnabled()).to.be.true;
// 	});

// 	it('PUBLISHER should not access to RECORDING feature', async () => {
// 		await browser.get(`${url}recordingSession`);

// 		await utils.waitForElement('#join-button');
// 		await utils.clickOn('#join-button');

// 		await utils.checkToolbarIsPresent();
// 		await utils.clickOn('#activities-panel-btn');

// 		await utils.waitForElement('ov-recording-activity');
// 		await utils.clickOn('ov-recording-activity');

// 		await utils.waitForElement('#start-recording-btn');
// 		expect(await utils.isPresent('.not-allowed-message')).to.be.false;

// 		incognitoBrowser = await createChromeBrowser(true);
// 		const incognitoUtils = new OpenViduCallPO(incognitoBrowser);

// 		await incognitoBrowser.get(`${url}recordingSession`);

// 		await incognitoUtils.waitForElement('#join-button');
// 		await incognitoUtils.clickOn('#join-button');

// 		await incognitoUtils.checkToolbarIsPresent();
// 		await incognitoUtils.clickOn('#activities-panel-btn');

// 		await incognitoUtils.waitForElement('ov-recording-activity');
// 		await incognitoUtils.clickOn('ov-recording-activity');

// 		await incognitoUtils.waitForElement('.not-allowed-message');
// 		expect(await incognitoUtils.isPresent('#start-recording-btn')).to.be.false;
// 		await incognitoBrowser.quit();
// 	});
// });
