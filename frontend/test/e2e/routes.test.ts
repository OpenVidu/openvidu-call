import { expect } from 'chai';
import { Builder, WebDriver } from 'selenium-webdriver';
import { OpenViduCallConfig } from './selenium.conf';
import { OpenViduCallPO } from './utils.po';
import { EDITION } from './config';

const APP_URL = OpenViduCallConfig.appUrl;

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
		await browser.get(`${APP_URL}/embedded`);
		await utils.waitForElement('#unauthorized-content');
		expect(await browser.getCurrentUrl()).to.include('embedded/unauthorized');
	});

	it('should allow access if accessed from iframe with invalid token', async () => {
		await utils.buildIframeAndSwitch(APP_URL + '/embedded?token=invalidToken');

		await utils.waitForElement('#unauthorized-content');

		const errorElement = await utils.waitForElement('#error-reason');

		expect(await errorElement.getText()).to.include('token');
		expect(await errorElement.getText()).to.include('invalid');

		await utils.removeIframe();
	});

	it('should allow access if accessed from iframe with valid token', async () => {
		const embeddedURL = await utils.getEmbeddedUrl();
		// Inject an iframe with the token
		await utils.buildIframeAndSwitch(embeddedURL);

		// Check if everything is loaded in the iframe
		await utils.checkLayoutIsPresent();
		await utils.checkToolbarIsPresent();

		await utils.leaveRoom();
		await utils.removeIframe();
	});

	it('should redirect to "unauthorized" if token is expired in embedded mode', async () => {
		const embeddedURL = await utils.getInvalidEmbeddedUrl();
		await utils.buildIframeAndSwitch(embeddedURL);

		await utils.waitForElement('#unauthorized-content');
		expect(await browser.getCurrentUrl()).to.include('unauthorized');

		await utils.removeIframe();
	});

	it('should redirect to an internal URL if provided in embedded mode', async () => {
		const redirectUrl = '/console/overview';
		const embeddedURL = await utils.getEmbeddedUrl();

		await utils.buildIframeAndSwitch(`${embeddedURL}&redirectUrl=${redirectUrl}`);

		await utils.checkLayoutIsPresent();
		await utils.checkToolbarIsPresent();

		await utils.leaveRoom();

		await utils.waitForElement('#unauthorized-content');
		expect(await browser.getCurrentUrl()).to.equal(`${APP_URL}/unauthorized`);

		const iframeUrl = await utils.getIframeUrl();
		expect(iframeUrl).to.include(`${APP_URL}/unauthorized`);
	});

	it('should redirect to a external URL if provided in embedded mode', async () => {
		const redirectUrl = 'https://openvidu.io';
		const embeddedURL = await utils.getEmbeddedUrl();
		await utils.buildIframeAndSwitch(`${embeddedURL}&redirectUrl=${redirectUrl}`);

		await utils.checkLayoutIsPresent();
		await utils.checkToolbarIsPresent();

		await utils.leaveRoom();

		const iframeUrl = await utils.getIframeUrl();
		expect(iframeUrl).to.include(redirectUrl);
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
		await browser.get(APP_URL);
		expect(await browser.getCurrentUrl()).to.include('home');
	});

	it('should redirect to "unauthorized" if token is invalid', async () => {
		await browser.get(`${APP_URL}/room123?token=invalidToken`);
		await utils.waitForElement('#unauthorized-content');
		expect(await browser.getCurrentUrl()).to.include('unauthorized');
	});

	it('should set the standalone mode with token if token is provided', async () => {
		const token = await utils.getToken('TEST_ROOM', 'TEST_PARTICIPANT');

		await browser.get(`${APP_URL}/room123?token=${token}`);

		await utils.checkLayoutIsPresent();
		await utils.checkToolbarIsPresent();
		const roomName = await utils.getRoomName();
		expect(roomName).not.to.be.equal('room123');
		expect(roomName).to.be.equal('TEST_ROOM');

		await utils.leaveRoom();
	});


	it('should set the standalone mode with room name if token is not provided', async () => {
		await browser.get(`${APP_URL}/Room123`);
		await utils.checkPrejoinIsPresent();
		await utils.joinRoom();
		expect(await browser.getCurrentUrl()).to.include('Room123');

		await utils.checkLayoutIsPresent();
		const roomName = await utils.getRoomName();
		expect(roomName).to.be.equal('Room123');
		await utils.leaveRoom();
	});

	it('should redirect to "unauthorized" if accessed in embedded mode', async () => {
		await utils.buildIframeAndSwitch(APP_URL + '/Room123');

		await utils.waitForElement('#unauthorized-content');

		await utils.waitForElement('#error-reason');

		await utils.removeIframe();
	});

	it('should redirect to "unauthorized" if external URL and token provided without embedded path', async () => {
		const redirectUrl = 'https://openvidu.io';
		const token = await utils.getInvalidToken();
		await utils.buildIframeAndSwitch(`${APP_URL}/?token=${token}&redirectUrl=${redirectUrl}`);

		await utils.waitForElement('#unauthorized-content');

		await utils.waitForElement('#error-reason');

		await utils.removeIframe();
	});

	it('should redirect to home page if no token and room name are provided', async () => {
		await browser.get(APP_URL);
		expect(await browser.getCurrentUrl()).to.include('home');

		await browser.get(APP_URL + '/?invalidParam=123');
		expect(await browser.getCurrentUrl()).to.include('home');
	});

	it('should redirect to an external URL without token provided', async () => {
		const redirectUrl = 'https://openvidu.io';
		await browser.get(`${APP_URL}/Room123?redirectUrl=${redirectUrl}`);
		await utils.checkPrejoinIsPresent();
		await utils.joinRoom();
		await utils.checkLayoutIsPresent();
		await utils.checkToolbarIsPresent();

		await utils.leaveRoom();

		const currentUrl = await browser.getCurrentUrl();
		expect(currentUrl).to.include(redirectUrl);
	});

	it('should redirect to an external URL with token provided', async () => {
		const redirectUrl = 'https://openvidu.io';
		const token = await utils.getToken();
		console.log(`${APP_URL}/?token=${token}&redirectUrl=${redirectUrl}`)
		await browser.get(`${APP_URL}/?token=${token}&redirectUrl=${redirectUrl}`);

		await utils.checkLayoutIsPresent();
		await utils.checkToolbarIsPresent();

		await utils.leaveRoom();

		const currentUrl = await browser.getCurrentUrl();
		expect(currentUrl).to.include(redirectUrl);
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
		await browser.get(`${APP_URL}/console/invalidRoute`);
		expect(await browser.getCurrentUrl()).to.include('console/overview');
	});

	it('should redirect to "unauthorized" if accessed from an iframe', async () => {
		await utils.buildIframeAndSwitch(APP_URL + '/console');

		await utils.waitForElement('#unauthorized-content');

		await utils.waitForElement('#error-reason');

		await utils.removeIframe();
	});

	it('should load the "overview" route inside "console"', async () => {
		await browser.get(APP_URL + '/console/overview');
		await utils.waitForElement('ov-overview');
	});

	it('should load the "access-permissions" route inside "console"', async () => {
		await browser.get(APP_URL + '/console/access-permissions');
		await utils.waitForElement('ov-access-permissions');
	});

	(EDITION === 'CE' ? it : it.skip)('should load the "appearance" route inside "console"', async () => {
		await browser.get(APP_URL + '/console/appearance');
		await utils.waitForElement('ov-appearance');
		await utils.waitForElement('ov-pro-feature-card');
	});

	it('should load the "room-preferences" route inside "console"', async () => {
		await browser.get(APP_URL + '/console/room-preferences');
		await utils.waitForElement('ov-room-preferences');
	});

	it('should redirect to "overview" if no child route is specified', async () => {
		await browser.get(APP_URL + '/console');
		expect(await browser.getCurrentUrl()).to.include('console/overview');
	});
});

export {};