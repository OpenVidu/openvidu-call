'use strict';

import { by, element, protractor, ElementFinder, ProtractorBrowser } from 'protractor';

export class OpenViduCall {
  constructor() {}

  getInputDashboard(browser) {
    return browser.element(by.css('#room_card input'));
  }

  getRoomButton(browser): ElementFinder {
    return browser.element(by.css('#room_card button'));
  }
  getShareScreenButton(browser): ElementFinder {
    return browser.element(by.css('#navScreenButton'));
  }

  getDialogExtension(browser): ElementFinder {
    return browser.element(by.css('#dialogExtension'));
  }

  getDialogCancelButton(browser): ElementFinder {
    return browser.element(by.css('#cancelButton'));
  }

  getFullscreenButton(browser): ElementFinder {
    return browser.element(by.css('#fullscreenButton'));
  }

  openNewBrowserInTheSameRoom(browser): ProtractorBrowser {
    return browser.forkNewDriverInstance(true);
  }

  getLocalNickname(browser): ElementFinder {
    return browser.element(by.css('#localUser #nickname'));
  }
  getRemoteNickname(browser): ElementFinder {
    return browser.element(by.css('#remoteUsers #nickname'));
  }

  getDialogNickname(browser): ElementFinder {
    return browser.element(by.css('#dialogNickname'));
  }

  getCamButton(browser): ElementFinder {
    return browser.element(by.css('#navCamButton'));
  }

  getCamIcon(browser): ElementFinder {
    return browser.element(by.css('#statusCam'));
  }

  getMicButton(browser): ElementFinder {
    return browser.element(by.css('#navMicButton'));
  }

  getMicIcon(browser): ElementFinder {
    return browser.element(by.css('#statusMic'));
  }

  getLeaveButton(browser): ElementFinder {
    return browser.element(by.css('#navLeaveButton'));
  }

  getChatButton(browser): ElementFinder {
    return browser.element(by.css('#navChatButton'));
  }

  getVideo(browser): ElementFinder {
    return this.getChatContent(browser).element(by.css('video'));
  }

  getVideoList(browser): ElementFinder {
    return browser.element.all(by.css('video'));
  }

  getRemoteVideoList(browser): ElementFinder {
    return browser.element.all(by.css('#remoteUsers video'));
  }

  getChatContent(browser): ElementFinder {
    return browser.element(by.css('#chatComponent'));
  }

  getChatInput(browser): ElementFinder {
    return browser.element(by.id('chatInput'));
  }

  getNewMessagePoint(browser): ElementFinder {
    return browser.element(by.css('#mat-badge-content-0'));
  }

  pressEnter(browser) {
    browser
      .actions()
      .sendKeys(protractor.Key.ENTER)
      .perform();
  }

  getMessageList(browser) {
    return browser.element.all(by.css('#chatComponent .message-wrap .message .msg-detail'));
  }

  closeSession(browser) {
    const leaveButton = this.getLeaveButton(browser);
    leaveButton.click();
    browser.quit();
  }

  typeWithDelay(input, keys: string) {
    keys.split('').forEach((c) => input.sendKeys(c));
  }
}
