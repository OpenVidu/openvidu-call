import { expect } from 'chai';
import { By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { EMBEDDED_API_URL, APP_URL, STANDALONE_API_URL } from './config';
import ffmpeg from 'fluent-ffmpeg';

export class OpenViduCallPO {
	private TIMEOUT = 30 * 1000;
	private POLL_TIMEOUT = 1 * 1000;

	constructor(private browser: WebDriver) {}

	async createIframe(url: string): Promise<void> {
		// access to a page under the same domain
		await this.browser.get(`${APP_URL}/unauthorized`);
		await this.browser.executeScript(
			`const iframe = document.createElement('iframe');
			iframe.id = 'test-iframe';
			iframe.style.width = '100%';
			iframe.style.height = '500px';
			iframe.src = '${url}';
			iframe.allow = 'camera; microphone; display-capture; fullscreen';
			iframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms';

			document.body.appendChild(iframe);`
		);
	}

	async waitForIframe(): Promise<void> {
		await this.browser.wait(
			until.elementLocated(By.id('test-iframe')),
			this.TIMEOUT,
			'Time out waiting for iframe',
			this.POLL_TIMEOUT
		);
	}

	async switchToIframe(): Promise<void> {
		const iframe = await this.browser.findElement(By.id('test-iframe'));
		await this.browser.switchTo().frame(iframe);
	}

	async buildIframeAndSwitch(url: string): Promise<void> {
		await this.createIframe(url);
		await this.waitForIframe();
		await this.switchToIframe();
	}

	async getIframeUrl(): Promise<string> {
		return this.browser.executeScript('return window.location.href');
	}

	async removeIframe(): Promise<void> {
		await this.browser.executeScript(`document.getElementById('test-iframe')?.remove();`);
	}

	async getEmbeddedUrl(roomName?: string, participantName?: string): Promise<string> {
		if (!roomName) roomName = 'TestRoom-' + Math.random().toString(36).substring(7);

		if (!participantName) participantName = 'ParticipantName-' + Math.random().toString(36).substring(7);

		const response = await fetch(`${EMBEDDED_API_URL}/participant`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				roomName,
				participantName
			})
		});

		const responseJson: any = await response.json();
		return responseJson.embeddedURL;
	}

	async getInvalidEmbeddedUrl(): Promise<string> {
		return `${APP_URL}/embedded?token=eyJhbGciOiJIUzI1NiJ9.eyJtZXRhZGF0YSI6IntcImxpdmVraXRVcmxcIjpcIndzOi8vbG9jYWxob3N0Ojc4ODBcIixcInBlcm1pc3Npb25zXCI6e1wiY2FuUmVjb3JkXCI6dHJ1ZSxcImNhbkNoYXRcIjp0cnVlfX0iLCJuYW1lIjoiVGVzdFBhcnRpY2lwYW50IiwidmlkZW8iOnsicm9vbSI6IlRlc3RSb29tIiwicm9vbUNyZWF0ZSI6dHJ1ZSwicm9vbUpvaW4iOnRydWUsInJvb21MaXN0Ijp0cnVlLCJyb29tUmVjb3JkIjp0cnVlLCJyb29tQWRtaW4iOnRydWUsImluZ3Jlc3NBZG1pbiI6ZmFsc2UsImNhblB1Ymxpc2giOnRydWUsImNhblN1YnNjcmliZSI6dHJ1ZSwiY2FuUHVibGlzaERhdGEiOnRydWUsImNhblVwZGF0ZU93bk1ldGFkYXRhIjpmYWxzZSwiaGlkZGVuIjpmYWxzZSwicmVjb3JkZXIiOmZhbHNlLCJhZ2VudCI6ZmFsc2V9LCJpc3MiOiJkZXZrZXkiLCJleHAiOjE3MzkyMDA0OTMsIm5iZiI6MCwic3ViIjoiVGVzdFBhcnRpY2lwYW50In0.7BEE9sdDrkG2VtEkmlJtAfH1YAnOHprBd2HyBLyu8TY`;
	}

	async getToken(roomName?: string, participantName?: string): Promise<string> {
		if (!roomName) roomName = 'TestRoom-' + Math.random().toString(36).substring(7);

		if (!participantName) participantName = 'ParticipantName-' + Math.random().toString(36).substring(7);

		const response = await fetch(`${STANDALONE_API_URL}/rooms`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				roomName,
				participantName
			})
		});

		const responseJson: any = await response.json();
		return responseJson.token;
	}

	async getInvalidToken(): Promise<string> {
		return `eyJhbGciOiJIUzI1NiJ9.eyJtZXRhZGF0YSI6IntcImxpdmVraXRVcmxcIjpcIndzOi8vbG9jYWxob3N0Ojc4ODBcIixcInBlcm1pc3Npb25zXCI6e1wiY2FuUmVjb3JkXCI6dHJ1ZSxcImNhbkNoYXRcIjp0cnVlfX0iLCJuYW1lIjoiVGVzdFBhcnRpY2lwYW50IiwidmlkZW8iOnsicm9vbSI6IlRlc3RSb29tIiwicm9vbUNyZWF0ZSI6dHJ1ZSwicm9vbUpvaW4iOnRydWUsInJvb21MaXN0Ijp0cnVlLCJyb29tUmVjb3JkIjp0cnVlLCJyb29tQWRtaW4iOnRydWUsImluZ3Jlc3NBZG1pbiI6ZmFsc2UsImNhblB1Ymxpc2giOnRydWUsImNhblN1YnNjcmliZSI6dHJ1ZSwiY2FuUHVibGlzaERhdGEiOnRydWUsImNhblVwZGF0ZU93bk1ldGFkYXRhIjpmYWxzZSwiaGlkZGVuIjpmYWxzZSwicmVjb3JkZXIiOmZhbHNlLCJhZ2VudCI6ZmFsc2V9LCJpc3MiOiJkZXZrZXkiLCJleHAiOjE3MzkyMDA0OTMsIm5iZiI6MCwic3ViIjoiVGVzdFBhcnRpY2lwYW50In0.7BEE9sdDrkG2VtEkmlJtAfH1YAnOHprBd2HyBLyu8TY`;
	}

	async waitForElement(selector: string): Promise<WebElement> {
		return await this.browser.wait(
			until.elementLocated(By.css(selector)),
			this.TIMEOUT,
			`Time out waiting for ${selector}`,
			this.POLL_TIMEOUT
		);
	}

	async isPresent(selector: string): Promise<boolean> {
		const elements = await this.browser.findElements(By.css(selector));
		return elements.length > 0;
	}

	async checkPrejoinIsPresent(): Promise<void> {
		await this.waitForElement('#prejoin-container');
		expect(await this.isPresent('#prejoin-container')).to.be.true;
	}

	async clickOn(selector: string): Promise<void> {
		const element = await this.waitForElement(selector);
		await element.click();
	}

	async checkToolbarIsPresent(): Promise<void> {
		await this.waitForElement('#toolbar');
		await this.waitForElement('#media-buttons-container');
		expect(await this.isPresent('#media-buttons-container')).to.be.true;
	}

	async checkLayoutIsPresent(): Promise<void> {
		await this.waitForElement('#layout-container');
		expect(await this.isPresent('#layout-container')).to.be.true;

		await this.waitForElement('#layout');
		expect(await this.isPresent('#layout')).to.be.true;
	}

	async enableScreenShare(): Promise<void> {
		await this.waitForElement('#screenshare-btn');
		await this.clickOn('#screenshare-btn');
		await this.browser.sleep(500);
	}

	async disableScreenShare(): Promise<void> {
		await this.waitForElement('#screenshare-btn');
		await this.clickOn('#screenshare-btn');
		await this.browser.sleep(500);
		await this.waitForElement('#screenshare-menu');
		await this.clickOn('#disable-screen-button');
		await this.browser.sleep(1000);
	}

	async checkLoginFormIsPresent(): Promise<void> {
		await this.waitForElement('#form-login');

		expect(await this.isPresent('#form-room')).to.be.false;

		await this.waitForElement('#login-username');

		await this.waitForElement('#login-password');
	}

	async login(username: string, password: string): Promise<void> {
		await this.waitForElement('#form-login');

		let element = await this.waitForElement('#login-username input');
		await element.sendKeys(username);

		element = await this.waitForElement('#login-password input');
		await element.sendKeys(password);

		await this.clickOn('#join-btn');
	}

	async joinRoom(): Promise<void> {
		await this.waitForElement('#join-button');
		await this.clickOn('#join-button');
	}

	async leaveRoom(): Promise<void> {
		await this.waitForElement('#leave-btn');
		await this.clickOn('#leave-btn');
	}

	async getRoomName(): Promise<string> {
		const element = await this.waitForElement('#session-name');
		return element.getText();
	}

	async openTab(url: string): Promise<string[]> {
		const newTabScript = `window.open("${url}")`;
		await this.browser.executeScript(newTabScript);
		return this.browser.getAllWindowHandles();
	}

	async sendKeys(selector: string, keys: string): Promise<void> {
		const element = await this.waitForElement(selector);
		await element.sendKeys(keys);
	}

	async applyVirtualBackground(bgId: string): Promise<void> {
		await this.waitForElement('#more-options-btn');
		await this.clickOn('#more-options-btn');

		await this.waitForElement('#virtual-bg-btn');
		await this.clickOn('#virtual-bg-btn');

		await this.waitForElement('ov-background-effects-panel');
		await this.browser.sleep(1000);
		await this.waitForElement(`#effect-${bgId}`);

		await this.clickOn(`#effect-${bgId}`);
		await this.clickOn('.panel-close-button');
		await this.browser.sleep(2000);
	}

	async getNumberOfElements(selector: string): Promise<number> {
		return (await this.browser.findElements(By.css(selector))).length;
	}

	async startRecordingFromToolbar(): Promise<void> {
		await this.waitForElement('#more-options-btn');
		await this.clickOn('#more-options-btn');

		await this.waitForElement('#recording-btn');
		await this.clickOn('#recording-btn');
		await this.checkRecordingIsStarting();
		await this.checkRecordingIsStarted();
	}

	async startRecordingFromPanel(): Promise<void> {
		await this.waitForElement('ov-activities-panel');
		await this.waitForElement('#start-recording-btn');
		await this.clickOn('#start-recording-btn');
		await this.checkRecordingIsStarting();
		await this.checkRecordingIsStarted();
	}

	async stopRecordingFromToolbar(): Promise<void> {
		await this.waitForElement('#more-options-btn');
		await this.clickOn('#more-options-btn');
		await this.waitForElement('#recording-btn');
		await this.clickOn('#recording-btn');
		await this.checkRecordingIsStopped();
	}

	async stopRecordingFromPanel(): Promise<void> {
		await this.waitForElement('ov-activities-panel');
		await this.waitForElement('#stop-recording-btn');
		await this.clickOn('#stop-recording-btn');
		await this.checkRecordingIsStopped();
	}

	async deleteRecording(): Promise<void> {
		await this.waitForElement('.recording-item');
		await this.waitForElement('#delete-recording-btn');
		await this.clickOn('#delete-recording-btn');

		await this.waitForElement('app-delete-dialog');
		await this.waitForElement('#delete-recording-confirm-btn');
		await this.clickOn('#delete-recording-confirm-btn');
	}

	async playRecording() {
		await this.waitForElement('.recording-item');
		await this.waitForElement('#play-recording-btn');
		await this.clickOn('#play-recording-btn');
	}

	async checkRecordingFileIsPlayable(filePath: string): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			ffmpeg(filePath)
				.on('error', (err) => {
					reject(new Error(`❌ Error trying to play the recording ${err.message}`));
				})
				.on('end', () => {
					console.log(`The recording file is playable.`);
					resolve();
				})
				.ffprobe((err) => {
					if (err) {
						reject(new Error(`❌ Error trying to play the recording: ${err.message}`));
					} else {
						console.log(`The recording file is playable.`);
						resolve();
					}
				});
		});
	}

	async checkRecordingIsStopped(): Promise<void> {
		await this.waitForElement('#recording-status.stopped');
	}

	async checkRecordingIsStarting(): Promise<void> {
		await this.waitForElement('ov-activities-panel');
		await this.waitForElement('#recording-status.starting');
	}

	async checkRecordingIsStopping(): Promise<void> {
		await this.waitForElement('ov-activities-panel');
		await this.waitForElement('#recording-status.stopping');
	}

	async checkRecordingIsStarted(): Promise<void> {
		await this.waitForElement('ov-activities-panel');
		await this.waitForElement('#recording-status.started');
		await this.waitForElement('#recording-tag');
	}
}
