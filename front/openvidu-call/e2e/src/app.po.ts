'use strict';

import { by, element, protractor } from 'protractor';

export class OpenViduCall {

  constructor() {}

  getInputDashboard(browser) {
    return browser.element(by.css('app-dashboard input'));
  }

  getRoomButton(browser) {
    return browser.element(by.css('button'));
  }
  getShareScreenButton(browser) {
    return browser.element(by.css('#navScreenButton'));
  }

  getDialogExtension(browser) {
    return browser.element(by.css('#dialogExtension'));
  }

  getFullscreenButton(browser){
    return browser.element(by.css('#fullscreenButton'));
  }

  openNewBrowserInTheSameRoom(browser) {
    return browser.forkNewDriverInstance(true);
  }

  getLocalNickname(browser) {
    return browser.element(by.css('#localNickname'));
  }
  getRemoteNickname(browser) {
    return browser.element(by.css('#remoteNickname'));
  }

  getDialogNickname(browser) {
    return browser.element(by.css('app-dialog-nickname #dialogNickname'));
  }

  getCamButton(browser) {
    return browser.element(by.css('#navCamButton'));
  }

  getCamIcon(browser) {
    return browser.element(by.css('#statusCam'));
  }

  getMicButton(browser) {
    return browser.element(by.css('#navMicButton'));
  }

  getMicIcon(browser) {
    return browser.element(by.css('#statusMic'));
  }

  getLeaveButton(browser) {
    return browser.element(by.css('#navLeaveButton'));
  }

  getChatButton(browser) {
    return browser.element(by.css('#navChatButton'));
  }

  getVideo(browser) {
    return browser.element(by.css('.OT_widget-container'));
  }

  getVideoList(browser) {
    return browser.element.all(by.css('.OT_widget-container'));
  }

  getRemoteVideoList(browser) {
    return browser.element.all(by.css('.OV_big video'));
  }

  getChatContent(browser) {
    return browser.element(by.css('#chatComponent'));
  }

  getChatInput(browser) {
    return browser.element(by.css('input'));
  }

  getNewMessagePoint(browser) {
    return browser.element(by.css('#point'));
  }

  pressEnter(browser) {
    browser
      .actions()
      .sendKeys(protractor.Key.ENTER)
      .perform();
  }

  getMessageList(browser) {
    return browser.element.all(by.css('.msg-detail'));
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
