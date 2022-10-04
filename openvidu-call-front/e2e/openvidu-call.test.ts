import { expect } from 'chai';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';

import { OpenViduCallConfig } from './selenium.conf';

const url = OpenViduCallConfig.appUrl;
const TIMEOUT = 10000;

describe('Testing SURFACE FEATURES ', () => {
	let browser: WebDriver;

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
	});

	afterEach(async () => {
		await browser.quit();
	});

	it('should show the SESSION NAME input', async () => {
		await browser.get(url);
		let element: any = await browser.wait(until.elementLocated(By.id('login-username')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		element = await browser.wait(until.elementLocated(By.id('login-username')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
	});
});
