import { OpenViduCall } from './app.po';
import { browser, element, by } from 'protractor';
import { protractor } from 'protractor/built/ptor';

describe('Connect with a room *Dashboard*', () => {
  const OVC = new OpenViduCall();

  beforeEach(() => {
    browser.waitForAngularEnabled(false);
    return browser.get('/');
  });

  it('should navegate to codeURJC room', () => {
    const inputRoom = OVC.getInputDashboard(browser);
    const roomButton = OVC.getRoomButton(browser);
    inputRoom.sendKeys('codeURJC');
    roomButton.click();
    expect(browser.getCurrentUrl()).toMatch('/codeURJC');
  });
});

describe('Test room ', () => {
  const OVC = new OpenViduCall();
  const EC = protractor.ExpectedConditions;

  beforeEach(() => {
    browser.waitForAngularEnabled(false);
    return browser.get('/codeURJC');
  });

  it('should set disabled the webcam and show the icon', () => {
    const camButton = OVC.getCamButton(browser);
    const camIcon = OVC.getCamIcon(browser);

    browser.wait(EC.elementToBeClickable(camButton), 5000);
    camButton.click();
    expect(camIcon.isDisplayed()).toBeTruthy();
  });

  it('should set disabled the microphone and show the icon', () => {
    const micButton = OVC.getMicButton(browser);
    const micIcon = OVC.getMicIcon(browser);

    browser.wait(EC.elementToBeClickable(micButton), 5000);
    micButton.click();
    expect(micIcon.isDisplayed()).toBeTruthy();
  });
  it('should show the screen share dialog', () => {
    const shareButton = OVC.getShareScreenButton(browser);
    const dialogExtension = OVC.getDialogExtension(browser);

    browser.wait(EC.elementToBeClickable(shareButton), 5000);
    shareButton.click();
    browser.wait(EC.presenceOf(dialogExtension), 5000);
    expect(dialogExtension.isDisplayed()).toBeTruthy();
  });
  it('should enter and exit fullscreen', () => {
    const fullscreenButton = OVC.getFullscreenButton(browser);
    const video = OVC.getVideo(browser);

    browser.wait(EC.elementToBeClickable(fullscreenButton), 5000);
    fullscreenButton.click();
    browser.sleep(1000);
    browser.driver.manage().window().getSize().then((value) => {
        expect(value.width === video.width && value.height === video.height);
        fullscreenButton.click();
        browser.driver.manage().window().getSize().then((value2) => {
            expect(value2.width !== video.width && value2.height !== video.height);
          });
      });
  });

  it('should change the username', () => {
    const localNickname = OVC.getLocalNickname(browser);
    const dialogNickname = OVC.getDialogNickname(browser);

    browser.wait(EC.elementToBeClickable(localNickname), 5000);
    localNickname.click();
    expect(dialogNickname.isDisplayed()).toBeTruthy();
    const inputDialog = dialogNickname.element(by.css('input'));
    inputDialog.clear();
    OVC.typeWithDelay(inputDialog, 'Carlos');
    dialogNickname.element(by.css('#acceptButton')).click();
    browser.sleep(1000);
    expect(localNickname.element(by.css('span')).getText()).toBe('Carlos (edit)');
  });

  it('should close the session', () => {
    const leaveButton = OVC.getLeaveButton(browser);
    browser.wait(EC.elementToBeClickable(leaveButton), 5000);
    leaveButton.click();
    expect(expect(browser.getCurrentUrl()).toMatch('/'));
  });
});

describe('Chat component', () => {
  const OVC = new OpenViduCall();
  const EC = protractor.ExpectedConditions;

  beforeEach(() => {
    browser.waitForAngularEnabled(false);
    return browser.get('/codeURJC');
  });

  it('should send a message', () => {
    const chatButton = OVC.getChatButton(browser);
    const chatInput = OVC.getChatInput(browser);
    const messageList = OVC.getMessageList(browser);

    browser.wait(EC.elementToBeClickable(chatButton), 5000);

    chatButton.click();
    chatInput.sendKeys('Message 1');
    browser
      .actions()
      .sendKeys(protractor.Key.ENTER)
      .perform();
    expect(messageList.count()).toEqual(1);
  });
});

describe('Two browsers: ', () => {
  const OVC = new OpenViduCall();
  const EC = protractor.ExpectedConditions;

  beforeEach(() => {
    browser.waitForAngularEnabled(false);
    return browser.get('/codeURJC');
  });

  it('should connect a new user', () => {
    const browser2 = OVC.openNewBrowserInTheSameRoom(browser);
    const videoBrowser1 = OVC.getVideoList(browser);
    // avoid timeout waiting angular
    browser2.ignoreSynchronization = true;

    browser.sleep(3000);
    expect(videoBrowser1.count()).toEqual(2);
    OVC.closeSession(browser2);
  });

  it('a user should disconnect his WEBCAM and to be identified by other ', () => {
    const browser2 = OVC.openNewBrowserInTheSameRoom(browser);
    const camButton = OVC.getCamButton(browser);
    const camIcon = OVC.getCamIcon(browser);
    const camIconBrowser2 = OVC.getCamIcon(browser2);

    // avoid timeout waiting angular
    browser2.ignoreSynchronization = true;
    browser.wait(EC.elementToBeClickable(camButton), 5000);
    camButton.click();
    expect(camIcon.isDisplayed()).toBeTruthy();
    expect(camIconBrowser2.isDisplayed()).toBeTruthy();
    OVC.closeSession(browser2);
  });

  it('a user should disconnect his MICROPHONE and to be identified by other ', () => {
    const browser2 = OVC.openNewBrowserInTheSameRoom(browser);
    const micButton = OVC.getMicButton(browser);
    const micIcon = OVC.getMicIcon(browser);
    const micIconBrowser2 = OVC.getMicIcon(browser2);
    // avoid timeout waiting angular
    browser2.ignoreSynchronization = true;

    browser.wait(EC.elementToBeClickable(micButton), 5000);
    micButton.click();
    expect(micIcon.isDisplayed()).toBeTruthy();
    expect(micIconBrowser2.isDisplayed()).toBeTruthy();
    OVC.closeSession(browser2);
  });

  it('a user should send a MESSAGE and to be identified by other ', () => {
    const browser2 = OVC.openNewBrowserInTheSameRoom(browser);
    const chatButton = OVC.getChatButton(browser);
    const chatContent = OVC.getChatContent(browser);
    const chatInput = OVC.getChatInput(browser);
    const newMessagePoint = OVC.getNewMessagePoint(browser2);
    // avoid timeout waiting angular
    browser2.ignoreSynchronization = true;

    browser.wait(EC.elementToBeClickable(chatButton), 5000);
    chatButton.click();
    browser.wait(EC.visibilityOf(chatContent), 5000);
    expect(chatContent.isDisplayed).toBeTruthy();
    chatInput.sendKeys('New Message');
    OVC.pressEnter(browser);
    expect(newMessagePoint.isDisplayed()).toBeTruthy();
    OVC.closeSession(browser2);
  });

  it('both users should can type messages and reveive its', () => {
    const browser2 = OVC.openNewBrowserInTheSameRoom(browser);
    const chatButton = OVC.getChatButton(browser);
    const chatContent = OVC.getChatContent(browser);
    const chatInput = OVC.getChatInput(browser);
    const messgageList = OVC.getMessageList(browser);
    const chatButtonBrowser2 = OVC.getChatButton(browser2);
    const chatContentBrowser2 = OVC.getChatContent(browser2);
    const chatInputBrowser2 = OVC.getChatInput(browser2);
    const messgageListBrowser2 = OVC.getMessageList(browser2);
    // avoid timeout waiting angular
    browser2.ignoreSynchronization = true;

    browser.wait(EC.elementToBeClickable(chatButton), 5000);
    chatButton.click();
    chatInput.sendKeys('New Message User 1');
    OVC.pressEnter(browser);

    expect(messgageListBrowser2.count()).toEqual(1);
    chatButtonBrowser2.click();
    chatInputBrowser2.sendKeys('Message User 2');
    OVC.pressEnter(browser2);
    expect(messgageList.count()).toEqual(2);
    OVC.closeSession(browser2);
  });

  it('user should can change his nickname and to be checked by other', () => {
    const browser2 = OVC.openNewBrowserInTheSameRoom(browser);
    const localNickname = OVC.getLocalNickname(browser);
    const dialogNickname = OVC.getDialogNickname(browser);
    const remoteNickname = OVC.getRemoteNickname(browser2);

    // avoid timeout waiting angular
    browser2.ignoreSynchronization = true;
    browser.sleep(4000);
    localNickname.click();
    browser.wait(EC.presenceOf(dialogNickname), 8000);
    expect(dialogNickname.isDisplayed()).toBeTruthy();
    const inputDialog = dialogNickname.element(by.css('input'));
    inputDialog.clear();
    OVC.typeWithDelay(inputDialog, 'Carlos');
    dialogNickname.element(by.css('#acceptButton')).click();
    browser2.sleep(1000);
    expect(remoteNickname.getText()).toBe('Carlos');
    OVC.closeSession(browser2);
  });
});
