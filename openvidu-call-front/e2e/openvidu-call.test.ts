import { expect } from 'chai';
import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';

import { OpenViduCallConfig } from './selenium.conf';

const url = OpenViduCallConfig.appUrl;
const TIMEOUT = 30000;

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

	it('should show ONLY the SESSION NAME input', async () => {
		await browser.get(url);

		let elements: WebElement[] = await browser.findElements(By.id('login-username'));
		expect(elements.length).equals(0);

		elements = await browser.findElements(By.id('login-password'));
		expect(elements.length).equals(0);

		let element: WebElement = await browser.wait(until.elementLocated(By.id('session-name-input')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
	});

	it('should CHANGE the SESSION NAME', async () => {
		await browser.get(`${url}`);

		let sessionNameElement: WebElement = await browser.wait(until.elementLocated(By.id('session-name-input')), TIMEOUT);
		expect(await sessionNameElement.isDisplayed()).to.be.true;
		await browser.wait(async () => (await sessionNameElement.getAttribute('value')).length > 0, TIMEOUT);

		let sessionName = await sessionNameElement.getAttribute('value');
		let element: WebElement = await browser.wait(until.elementLocated(By.id('session-name-generator-btn')), TIMEOUT);
		await element.click();
		expect(await sessionNameElement.getAttribute('value')).to.not.equal(sessionName);
	});

	it('should show the PREJOIN page INSERTING the SESSION NAME', async () => {
		await browser.get(`${url}testSession`);

		let element: WebElement = await browser.wait(until.elementLocated(By.id('prejoin-container')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
	});
});
