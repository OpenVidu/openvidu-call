import { expect } from 'chai';
import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';

import { OpenViduCallConfig } from './selenium.conf';

const url = OpenViduCallConfig.appUrl;
const TIMEOUT = 10000;
describe('Testing AUTHENTICATION', () => {
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

	it('should show the LOGIN FORM inputs', async () => {
		try {
			await browser.get(url);
			let element: any = await browser.wait(until.elementLocated(By.id('login-username')), TIMEOUT);
			expect(await element.isDisplayed()).to.be.true;

			element = await browser.wait(until.elementLocated(By.id('login-password')), TIMEOUT);
			expect(await element.isDisplayed()).to.be.true;
		} catch (error) {
			console.log(await browser.takeScreenshot());
		}
	});

	it('should show an error when LOGIN with WRONG CREDENTIALS', async () => {
		await browser.get(url);
		let element: WebElement = await browser.wait(until.elementLocated(By.id('login-username')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		await element.sendKeys('user');

		element = await browser.wait(until.elementLocated(By.id('login-password')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		await element.sendKeys('user');

		element = await browser.wait(until.elementLocated(By.id('join-btn')), TIMEOUT);
		expect(await element.isEnabled()).to.be.true;
		await element.click();

		element = await browser.wait(until.elementLocated(By.id('login-error')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		expect(await element.getText()).to.be.equal('Authentication failed. Try again.');
	});

	it('should JOIN TO SESSION when LOGIN with VALID CREDENTIALS', async () => {
		await browser.get(url);
		let element: WebElement = await browser.wait(until.elementLocated(By.id('login-username')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		await element.sendKeys('admin');

		element = await browser.wait(until.elementLocated(By.id('login-password')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		await element.sendKeys('MY_SECRET');

		element = await browser.wait(until.elementLocated(By.id('join-btn')), TIMEOUT);
		expect(await element.isEnabled()).to.be.true;
		await element.click();

		element = await browser.wait(until.elementLocated(By.id('prejoin-container')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
	});

	it('should REDIRECT to the ROOT PATH with SAME SESSION NAME', async () => {
		await browser.get(`${url}testSession`);
		let element: WebElement = await browser.wait(until.elementLocated(By.id('login-username')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		element = await browser.wait(until.elementLocated(By.id('session-name-input')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		await browser.wait(async () => (await element.getAttribute('value')).length > 0, TIMEOUT);
		expect(await element.getAttribute('value')).equals('testSession');
	});
});
