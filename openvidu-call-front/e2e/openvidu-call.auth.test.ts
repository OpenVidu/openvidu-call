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
		// console.log('SCREENSHOT:');
		// console.log(`data:image/png;base64,${await browser.takeScreenshot()}`);
		await browser.quit();
	});

	it('should show the LOGIN FORM with DISABELD button', async () => {
		await browser.get(url);

		let element: WebElement = await browser.wait(until.elementIsVisible(browser.findElement(By.id('slogan-text'))));
		expect(await element.getText()).to.be.equal('Videoconference rooms in one click');

		element = await browser.wait(until.elementLocated(By.id('form-login')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		let elements: WebElement[] = await browser.findElements(By.id('form-session'));
		expect(elements.length).equals(0);

		element = await browser.wait(until.elementLocated(By.id('login-username')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		element = await browser.wait(until.elementLocated(By.id('login-password')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		element = await browser.wait(until.elementLocated(By.id('join-btn')), TIMEOUT);
		expect(await element.isEnabled()).to.be.false;
	});

	it('should show an error when LOGIN with WRONG CREDENTIALS', async () => {
		await browser.get(url);

		let element: WebElement = await browser.wait(until.elementIsVisible(browser.findElement(By.id('slogan-text'))));
		expect(await element.getText()).to.be.equal('Videoconference rooms in one click');

		element = await browser.wait(until.elementLocated(By.id('form-login')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		element = await browser.wait(until.elementLocated(By.css('#login-username input')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		await element.sendKeys('user');

		element = await browser.wait(until.elementLocated(By.css('#login-password input')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		await element.sendKeys('user');

		element = await browser.wait(until.elementLocated(By.id('join-btn')), TIMEOUT);
		expect(await element.isEnabled()).to.be.true;
		await element.click();

		element = await browser.wait(until.elementLocated(By.id('login-error')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		expect(await element.getText()).to.be.equal('Authentication failed. Try again.');
	});

	it('should show the SESSION NAME form when LOGIN with VALID CREDENTIALS', async () => {
		await browser.get(url);

		let element: WebElement = await browser.wait(until.elementIsVisible(browser.findElement(By.id('slogan-text'))));
		expect(await element.getText()).to.be.equal('Videoconference rooms in one click');

		element = await browser.wait(until.elementLocated(By.id('form-login')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		element = await browser.wait(until.elementLocated(By.css('#login-username input')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		await element.sendKeys('admin');

		element = await browser.wait(until.elementLocated(By.css('#login-password input')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		await element.sendKeys('MY_SECRET');

		element = await browser.wait(until.elementLocated(By.id('join-btn')), TIMEOUT);
		expect(await element.isEnabled()).to.be.true;
		await element.click();

		element = await browser.wait(until.elementLocated(By.id('form-session')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		let elements: WebElement[] = await browser.findElements(By.id('prejoin-container'));
		expect(elements.length).equals(0);

		element = await browser.wait(until.elementLocated(By.id('join-btn')), TIMEOUT);
		expect(await element.isEnabled()).to.be.true;
	});

	it('should be able to JOIN with a VALID CREDENTIALS AND SESSION', async () => {
		await browser.get(url);

		let element: WebElement = await browser.wait(until.elementIsVisible(browser.findElement(By.id('slogan-text'))));
		expect(await element.getText()).to.be.equal('Videoconference rooms in one click');

		element = await browser.wait(until.elementLocated(By.id('form-login')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		element = await browser.wait(until.elementLocated(By.css('#login-username input')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		await element.sendKeys('admin');

		element = await browser.wait(until.elementLocated(By.css('#login-password input')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		await element.sendKeys('MY_SECRET');

		element = await browser.wait(until.elementLocated(By.id('join-btn')), TIMEOUT);
		expect(await element.isEnabled()).to.be.true;
		await element.click();

		element = await browser.wait(until.elementLocated(By.id('form-session')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		let elements: WebElement[] = await browser.findElements(By.id('prejoin-container'));
		expect(elements.length).equals(0);

		element = await browser.wait(until.elementLocated(By.id('join-btn')), TIMEOUT);
		expect(await element.isEnabled()).to.be.true;
		await element.click();

		await browser.wait(until.elementLocated(By.id('prejoin-container')), TIMEOUT);
		elements = await browser.findElements(By.id('prejoin-container'));
		expect(elements.length).to.be.greaterThan(0);
	});

	it('should REDIRECT to the ROOT PATH with SAME SESSION NAME', async () => {
		await browser.get(`${url}testSession`);

		let element: WebElement = await browser.wait(until.elementIsVisible(browser.findElement(By.id('slogan-text'))));
		expect(await element.getText()).to.be.equal('Videoconference rooms in one click');

		element = await browser.wait(until.elementLocated(By.id('login-username')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		let elements: WebElement[] = await browser.findElements(By.id('form-session'));
		expect(elements.length).equals(0);

		element = await browser.wait(until.elementLocated(By.id('login-username')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		element = await browser.wait(until.elementLocated(By.id('login-password')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		element = await browser.wait(until.elementLocated(By.id('join-btn')), TIMEOUT);
		expect(await element.isEnabled()).to.be.false;
	});

	it('should ENTER to the PREJOIN PAGE injecting the session name in the url', async () => {
		await browser.get(`${url}`);

		let element: WebElement = await browser.wait(until.elementIsVisible(browser.findElement(By.id('slogan-text'))));
		expect(await element.getText()).to.be.equal('Videoconference rooms in one click');

		element = await browser.wait(until.elementLocated(By.id('login-username')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		let elements: WebElement[] = await browser.findElements(By.id('form-session'));
		expect(elements.length).equals(0);

		element = await browser.wait(until.elementLocated(By.css('#login-username input')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		await element.sendKeys('admin');

		element = await browser.wait(until.elementLocated(By.css('#login-password input')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
		await element.sendKeys('MY_SECRET');

		element = await browser.wait(until.elementLocated(By.id('join-btn')), TIMEOUT);
		expect(await element.isEnabled()).to.be.true;
		await element.click();

		element = await browser.wait(until.elementLocated(By.id('form-session')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		element = await browser.wait(until.elementLocated(By.id('join-btn')), TIMEOUT);
		expect(await element.isEnabled()).to.be.true;
		await element.click();

		element = await browser.wait(until.elementLocated(By.id('prejoin-container')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;

		await browser.navigate().refresh();

		element = await browser.wait(until.elementLocated(By.id('prejoin-container')), TIMEOUT);
		expect(await element.isDisplayed()).to.be.true;
	});
});
