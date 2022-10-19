import { expect } from 'chai';
import { Builder, WebDriver, WebElement } from 'selenium-webdriver';

import { OpenViduCallConfig } from './selenium.conf';
import { OpenViduCallPO } from './utils.po.test';

const url = OpenViduCallConfig.appUrl;

describe('Testing AUTHENTICATION', () => {
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
		// console.log(`data:image/png;base64,${await browser.takeScreenshot()}`);
		await browser.quit();
	});

	it('should show the LOGIN FORM with DISABELD button', async () => {
		await browser.get(url);

		let element: WebElement = await utils.waitForElement('#slogan-text');
		expect(await element.getText()).to.be.equal('Videoconference rooms in one click');

		await utils.waitForElement('#form-login');

		expect(await utils.isPresent('#form-session')).to.be.false;

		await utils.waitForElement('#login-username');

		await utils.waitForElement('#login-password');

		element = await utils.waitForElement('#join-btn');
		expect(await element.isEnabled()).to.be.false;
	});

	it('should show an error when LOGIN with WRONG CREDENTIALS', async () => {
		await browser.get(url);

		let element: WebElement = await utils.waitForElement('#slogan-text');
		expect(await element.getText()).to.be.equal('Videoconference rooms in one click');

		await utils.waitForElement('#form-login');

		element = await utils.waitForElement('#login-username input');
		await element.sendKeys('user');

		element = await utils.waitForElement('#login-password input');
		await element.sendKeys('user');

		await utils.clickOn('#join-btn');

		element = await utils.waitForElement('#login-error');
		expect(await element.getText()).to.be.equal('Authentication failed. Try again.');
	});

	it('should show the SESSION NAME form when LOGIN with VALID CREDENTIALS', async () => {
		await browser.get(url);

		let element: WebElement = await utils.waitForElement('#slogan-text');
		expect(await element.getText()).to.be.equal('Videoconference rooms in one click');

		await utils.waitForElement('#form-login');

		element = await utils.waitForElement('#login-username input');
		await element.sendKeys('admin');

		element = await utils.waitForElement('#login-password input');
		await element.sendKeys('MY_SECRET');

		await utils.clickOn('#join-btn');

		await utils.waitForElement('#form-session');

		expect(await utils.isPresent('prejoin-container')).to.be.false;

		await utils.waitForElement('#join-btn');
		expect(await utils.isPresent('#join-btn')).to.be.true;
	});

	it('should do LOGOUT and show the LOGIN FORM when logout button is clicked', async () => {
		await browser.get(url);

		await utils.waitForElement('#slogan-text');
		await utils.waitForElement('#form-login');

		let element = await utils.waitForElement('#login-username input');
		await element.sendKeys('admin');

		element = await utils.waitForElement('#login-password input');
		await element.sendKeys('MY_SECRET');

		await utils.clickOn('#join-btn');

		await utils.waitForElement('#form-session');

		element = await utils.waitForElement('#logout-content span');
		expect(await element.getText()).equal('Hi admin, do you want to logout?');

		await utils.clickOn('#logout-btn');

		await utils.waitForElement('#form-login');

		element = await utils.waitForElement('#login-username input');
		expect(await element.getAttribute('value')).equal('admin');

		element = await utils.waitForElement('#login-password input');
		expect(await element.getAttribute('value')).equal('MY_SECRET');

		element = await utils.waitForElement('#join-btn');
		expect(await element.isEnabled()).to.be.true;

		expect(await utils.isPresent('#logout-btn')).to.be.false;

		await browser.navigate().refresh();

		await utils.waitForElement('#slogan-text');

		expect(await utils.isPresent('#logout-btn')).to.be.false;
	});

	it('should be able to JOIN with a VALID CREDENTIALS AND SESSION', async () => {
		await browser.get(url);

		await utils.waitForElement('#slogan-text');
		await utils.waitForElement('#form-login');

		let element = await utils.waitForElement('#login-username input');
		await element.sendKeys('admin');

		element = await utils.waitForElement('#login-password input');
		await element.sendKeys('MY_SECRET');

		await utils.clickOn('#join-btn');

		await utils.waitForElement('#form-session');

		expect(await utils.isPresent('#prejoin-container')).to.be.false;

		await utils.clickOn('#join-btn');

		await utils.checkPrejoinIsPresent();
	});

	it('should REDIRECT to the ROOT PATH with SAME SESSION NAME', async () => {
		await browser.get(`${url}testSession`);

		await utils.waitForElement('#slogan-text');

		await utils.waitForElement('#form-login');

		expect(await utils.isPresent('#form-session')).to.be.false;

		await utils.waitForElement('#login-username');

		await utils.waitForElement('#login-password');

		let element = await utils.waitForElement('#join-btn');
		expect(await element.isEnabled()).to.be.false;

		element = await utils.waitForElement('#login-username input');
		await element.sendKeys('admin');

		element = await utils.waitForElement('#login-password input');
		await element.sendKeys('MY_SECRET');

		await utils.clickOn('#join-btn');

		element = await utils.waitForElement('#form-session input');
		expect(await element.getAttribute('value')).equal('testSession');
	});

	it('should ENTER to the PREJOIN PAGE refreshing AFTER LOGIN', async () => {
		await browser.get(`${url}`);

		await utils.waitForElement('#slogan-text');
		await utils.waitForElement('#form-login');

		let element = await utils.waitForElement('#login-username input');
		await element.sendKeys('admin');

		element = await utils.waitForElement('#login-password input');
		await element.sendKeys('MY_SECRET');

		await utils.clickOn('#join-btn');

		await utils.waitForElement('#form-session');

		expect(await utils.isPresent('#prejoin-container')).to.be.false;

		await utils.clickOn('#join-btn');

		await utils.checkPrejoinIsPresent();

		await browser.navigate().refresh();
		await utils.checkPrejoinIsPresent();
	});
});
