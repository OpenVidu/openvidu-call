import { expect } from 'chai';
import { By, until, WebDriver, WebElement } from 'selenium-webdriver';

export class OpenViduCallPO {
	private TIMEOUT = 30 * 1000;
	private POLL_TIMEOUT = 1 * 1000;

	constructor(private browser: WebDriver) {}

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
}
