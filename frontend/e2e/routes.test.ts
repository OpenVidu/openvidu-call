import { expect } from 'chai';
import { Builder, WebDriver } from 'selenium-webdriver';
import { OpenViduCallConfig } from './selenium.conf';
import { OpenViduCallPO } from './utils.po.test';
import { EDITION } from './config';

const url = OpenViduCallConfig.appUrl;

async function createChromeBrowser(): Promise<WebDriver> {
	return await new Builder()
		.forBrowser(OpenViduCallConfig.browserName)
		.withCapabilities(OpenViduCallConfig.browserCapabilities)
		.setChromeOptions(OpenViduCallConfig.browserOptions)
		.usingServer(OpenViduCallConfig.seleniumAddress)
		.build();
}

describe('Testing Embedded Mode', () => {
	let browser: WebDriver;
	let utils: OpenViduCallPO;

	beforeEach(async () => {
		browser = await createChromeBrowser();
		utils = new OpenViduCallPO(browser);
	});

	afterEach(async () => {
		await browser.quit();
	});

	it('should redirect to "unauthorized" if not accessed from an iframe', async () => {
		await browser.get(`${url}/embedded`);
		await utils.waitForElement('#unauthorized-content');
		expect(await browser.getCurrentUrl()).to.include('embedded/unauthorized');
	});

	it('should allow access if accessed from iframe with invalid token', async () => {
		await utils.buildIframeAndSwitch(url + '/embedded?token=invalidToken');

		await utils.waitForElement('#unauthorized-content');

		const errorElement = await utils.waitForElement('#error-reason');

		expect(await errorElement.getText()).to.include('token');
		expect(await errorElement.getText()).to.include('invalid');

		await utils.removeIframe();
	});

	it('should allow access if accessed from iframe with valid token', async () => {
		// access to a page under the same domain
		await browser.get(`${url}/unauthorized`);
		const token = await utils.getJWTToken();
		// Inject an iframe with the token
		await utils.buildIframeAndSwitch(`${url}/embedded?token=${token}`);

		// Check if everything is loaded in the iframe
		await utils.checkLayoutIsPresent();
		await utils.checkToolbarIsPresent();

		await utils.leaveRoom();
		await utils.removeIframe();
	});

	it('should redirect to "unauthorized" if token is expired in embedded mode', async () => {
		// access to a page under the same domain
		await browser.get(`${url}/unauthorized`);
		const expiredToken = await utils.getExpiredJWTToken();
		await utils.buildIframeAndSwitch(url + `/embedded?token=${expiredToken}`);

		await utils.waitForElement('#unauthorized-content');
		expect(await browser.getCurrentUrl()).to.include('unauthorized');

		await utils.removeIframe();
	});
});

describe('Testing Standalone Mode', () => {
	let browser: WebDriver;
	let utils: OpenViduCallPO;

	beforeEach(async () => {
		browser = await createChromeBrowser();
		utils = new OpenViduCallPO(browser);
	});

	afterEach(async () => {
		await browser.quit();
	});

	it('should redirect to "home" page if no room name and token are provided', async () => {
		await browser.get(url);
		expect(await browser.getCurrentUrl()).to.include('home');
	});

	it('should redirect to "unauthorized" if token is invalid', async () => {
		await browser.get(`${url}/room123?token=invalidToken`);
		await utils.waitForElement('#unauthorized-content');
		expect(await browser.getCurrentUrl()).to.include('unauthorized');
	});

	it('should set the standalone mode with token if token is provided', async () => {
		const token = await utils.getJWTToken('TEST_ROOM', 'TEST_PARTICIPANT');

		await browser.get(`${url}/room123?token=${token}`);

		await utils.checkLayoutIsPresent();
		await utils.checkToolbarIsPresent();
		const roomName = await utils.getRoomName();
		expect(roomName).not.to.be.equal('room123');
		expect(roomName).to.be.equal('TEST_ROOM');

		await utils.leaveRoom();
	});

	it('should set the standalone mode with token if token is provided', async () => {
		const token = await utils.getJWTToken('TEST_ROOM', 'TEST_PARTICIPANT');

		await browser.get(`${url}?token=${token}`);

		await utils.checkLayoutIsPresent();
		await utils.checkToolbarIsPresent();
		const roomName = await utils.getRoomName();
		expect(roomName).not.to.be.equal('room123');
		expect(roomName).to.be.equal('TEST_ROOM');

		await utils.leaveRoom();
	});

	it('should set the standalone mode with room name if token is not provided', async () => {
		await browser.get(`${url}/Room123`);
		await utils.checkPrejoinIsPresent();
		await utils.joinRoom();
		expect(await browser.getCurrentUrl()).to.include('Room123');

		await utils.checkLayoutIsPresent();
		const roomName = await utils.getRoomName();
		expect(roomName).to.be.equal('Room123');
		await utils.leaveRoom();
	});

	it('should redirect to "unauthorized" if accessed in embedded mode', async () => {
		await utils.buildIframeAndSwitch(url + '/Room123');

		await utils.waitForElement('#unauthorized-content');

		await utils.waitForElement('#error-reason');

		await utils.removeIframe();
	});
});

describe('Testing Console Routes', () => {
	let browser: WebDriver;
	let utils: OpenViduCallPO;

	beforeEach(async () => {
		browser = await createChromeBrowser();
		utils = new OpenViduCallPO(browser);
	});

	afterEach(async () => {
		await browser.quit();
	});

	// FIXME: This test is failing because the console route is not protected yet
	// it('should redirect to "unauthorized" if accessing console without authentication', async () => {
	// 	await browser.get(url + '/console');
	// 	await utils.waitForElement('#unauthorized-content');
	// 	expect(await browser.getCurrentUrl()).to.include('unauthorized');
	// });

	it('should redirect to "console/overview" if an invalid console route is provided', async () => {
		await browser.get(`${url}/console/invalidRoute`);
		expect(await browser.getCurrentUrl()).to.include('console/overview');
	});

	it('should redirect to "unauthorized" if accessed from an iframe', async () => {
		await utils.buildIframeAndSwitch(url + '/console');

		await utils.waitForElement('#unauthorized-content');

		await utils.waitForElement('#error-reason');

		await utils.removeIframe();
	});

	it('should load the "overview" route inside "console"', async () => {
		await browser.get(url + '/console/overview');
		await utils.waitForElement('ov-overview');
	});

	it('should load the "access-permissions" route inside "console"', async () => {
		await browser.get(url + '/console/access-permissions');
		await utils.waitForElement('ov-access-permissions');
	});

	(EDITION === 'CE' ? it : it.skip)('should load the "appearance" route inside "console"', async () => {
		await browser.get(url + '/console/appearance');
		await utils.waitForElement('ov-appearance');
		await utils.waitForElement('ov-pro-feature-card');
	});

	it('should load the "room-preferences" route inside "console"', async () => {
		await browser.get(url + '/console/room-preferences');
		await utils.waitForElement('ov-room-preferences');
	});

	it('should redirect to "overview" if no child route is specified', async () => {
		await browser.get(url + '/console');
		expect(await browser.getCurrentUrl()).to.include('console/overview');
	});
});
