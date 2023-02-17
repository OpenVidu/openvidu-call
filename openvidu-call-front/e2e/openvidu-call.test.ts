import { expect } from 'chai';
import { Builder, WebDriver } from 'selenium-webdriver';

import { OpenViduCallConfig } from './selenium.conf';
import { OpenViduCallPO } from './utils.po.test';

const url = OpenViduCallConfig.appUrl;

describe('Testing SURFACE FEATURES ', () => {
	let browser: WebDriver;
	let utils: OpenViduCallPO;

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
	});

	afterEach(async () => {
		await browser.quit();
	});

	it('should show ONLY the SESSION NAME input', async () => {
		await browser.get(url);

		expect(await utils.isPresent('#login-username')).to.be.false;

		expect(await utils.isPresent('#login-password')).to.be.false;

		await utils.waitForElement('#session-name-input');
		expect(await utils.isPresent('#session-name-input')).to.be.true;

		const button = await utils.waitForElement('#join-btn');
		expect(await utils.isPresent('#join-btn')).to.be.true;
		expect(await button.isEnabled()).to.be.true;
	});

	it('should CHANGE the SESSION NAME', async () => {
		await browser.get(`${url}`);

		const element = await utils.waitForElement('#session-name-input');
		expect(await utils.isPresent('#session-name-input')).to.be.true;

		let sessionName = await element.getAttribute('value');

		await utils.clickOn('#session-name-generator-btn');

		expect(await element.getAttribute('value')).to.not.equal(sessionName);
	});

	it('should show the PREJOIN page INSERTING the SESSION NAME', async () => {
		await browser.get(`${url}testSession`);

		await utils.checkPrejoinIsPresent();
	});
});

describe('Testing MODERATOR ACCESS features', () => {
	let browser: WebDriver;
	let incognitoBrowser: WebDriver;
	let utils: OpenViduCallPO;

	async function createChromeBrowser(incognito: boolean = false): Promise<WebDriver> {
		const browser = new Builder()
			.forBrowser(OpenViduCallConfig.browserName)
			.withCapabilities(OpenViduCallConfig.browserCapabilities)
			.setChromeOptions(OpenViduCallConfig.browserOptions)
			.usingServer(OpenViduCallConfig.seleniumAddress);

			if(incognito) {
				browser.setChromeOptions(browser.getChromeOptions().addArguments('--incognito'));
			}

			return await browser.build();
	}

	beforeEach(async () => {
		browser = await createChromeBrowser();
		utils = new OpenViduCallPO(browser);
	});

	afterEach(async () => {
		await browser.quit();
	});

	it('MODERATOR should have access to BROADCASTING feature', async () => {

		await browser.get(url);

		await utils.waitForElement('#join-btn');
		await utils.clickOn('#join-btn');

		await utils.waitForElement('#join-button');
		await utils.clickOn('#join-button');

		await utils.checkToolbarIsPresent();
		await utils.clickOn('#activities-panel-btn');

		await utils.waitForElement('ov-broadcasting-activity');
		await utils.clickOn('ov-broadcasting-activity');

		await utils.waitForElement('#broadcasting-url-input');
		expect(await utils.isPresent('not-allowed-message')).to.be.false;
	});

	it('PUBLISHER should not access to BROADCASTING feature', async () => {
		await browser.get(`${url}broadcastingSession`);

		await utils.waitForElement('#join-button');
		await utils.clickOn('#join-button');

		await utils.checkToolbarIsPresent();
		await utils.clickOn('#activities-panel-btn');

		await utils.waitForElement('ov-broadcasting-activity');
		await utils.clickOn('ov-broadcasting-activity');

		await utils.waitForElement('#broadcasting-url-input');
		expect(await utils.isPresent('.not-allowed-message')).to.be.false;


		incognitoBrowser = await createChromeBrowser(true);
		const incognitoUtils =  new OpenViduCallPO(incognitoBrowser);

		await incognitoBrowser.get(`${url}broadcastingSession`);

		await incognitoUtils.waitForElement('#join-button');
		await incognitoUtils.clickOn('#join-button');

		await incognitoUtils.checkToolbarIsPresent();
		await incognitoUtils.clickOn('#activities-panel-btn');

		await incognitoUtils.waitForElement('ov-broadcasting-activity');
		await incognitoUtils.clickOn('ov-broadcasting-activity');

		await incognitoUtils.waitForElement('.not-allowed-message');
		expect(await incognitoUtils.isPresent('#broadcasting-url-input')).to.be.false;
		await incognitoBrowser.quit();
	});

	it('MODERATOR should have access to RECORDING feature', async () => {

		await browser.get(url);

		const button = await utils.waitForElement('#join-btn');
		expect(await utils.isPresent('#join-btn')).to.be.true;
		expect(await button.isEnabled()).to.be.true;
	});

	it('PUBLISHER should not access to RECORDING feature', async () => {
		await browser.get(`${url}recordingSession`);

		await utils.waitForElement('#join-button');
		await utils.clickOn('#join-button');

		await utils.checkToolbarIsPresent();
		await utils.clickOn('#activities-panel-btn');

		await utils.waitForElement('ov-recording-activity');
		await utils.clickOn('ov-recording-activity');

		await utils.waitForElement('#start-recording-btn');
		expect(await utils.isPresent('.not-allowed-message')).to.be.false;


		incognitoBrowser = await createChromeBrowser(true);
		const incognitoUtils =  new OpenViduCallPO(incognitoBrowser);

		await incognitoBrowser.get(`${url}recordingSession`);

		await incognitoUtils.waitForElement('#join-button');
		await incognitoUtils.clickOn('#join-button');

		await incognitoUtils.checkToolbarIsPresent();
		await incognitoUtils.clickOn('#activities-panel-btn');

		await incognitoUtils.waitForElement('ov-recording-activity');
		await incognitoUtils.clickOn('ov-recording-activity');

		await incognitoUtils.waitForElement('.not-allowed-message');
		expect(await incognitoUtils.isPresent('#start-recording-btn')).to.be.false;
		await incognitoBrowser.quit();
	});
});
