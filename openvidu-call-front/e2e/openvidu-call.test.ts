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
