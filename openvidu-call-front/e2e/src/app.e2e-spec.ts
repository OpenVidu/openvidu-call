import { OpenViduCall } from './app.po';
import { browser, by, ProtractorBrowser } from 'protractor';
import { protractor } from 'protractor/built/ptor';

describe('Connect with a room *Dashboard*', () => { const OVC = new OpenViduCall();

  beforeEach(() => {
    browser.waitForAngularEnabled(false);
    browser.get('#/');
  });

  it('should navegate to codeURJC room', () => {
    OVC.getInputDashboard(browser).sendKeys('codeURJC');
    OVC.getRoomButton(browser).click();
    expect(browser.getCurrentUrl()).toMatch('#/codeURJC');
  });
});

describe('Test room ', () => {
  const OVC = new OpenViduCall();
  const EC = protractor.ExpectedConditions;

  beforeEach(() => {
    browser.waitForAngularEnabled(false);
    browser.get('#/codeURJC');
  });

  it('should set disabled the webcam and show the icon', () => {
    browser.sleep(3000);
    browser.wait(EC.elementToBeClickable(OVC.getCamButton(browser)), 5000);
    OVC.getCamButton(browser).click();
    browser.wait(EC.visibilityOf(OVC.getCamIcon(browser)), 5000);
    expect(OVC.getCamIcon(browser).isDisplayed()).toBeTruthy();
  });

  it('should set disabled the microphone and show the icon', () => {
    browser.sleep(3000);
    browser.wait(EC.elementToBeClickable(OVC.getMicButton(browser)), 5000);
    OVC.getMicButton(browser).click();
    browser.wait(EC.visibilityOf(OVC.getMicIcon(browser)), 5000);
    expect(OVC.getMicIcon(browser).isDisplayed()).toBeTruthy();
  });

  it('should show the screen share dialog', () => {
    browser.wait(EC.elementToBeClickable(OVC.getShareScreenButton(browser)), 5000);
    OVC.getShareScreenButton(browser).click();
    browser.wait(EC.presenceOf(OVC.getDialogExtension(browser)), 5000);
    expect(OVC.getDialogExtension(browser).isDisplayed()).toBeTruthy();
    const button = OVC.getDialogCancelButton(browser);
    button.click();
  });

  it('should enter and exit fullscreen', () => {
    browser.wait(EC.elementToBeClickable(OVC.getFullscreenButton(browser)), 5000);
    const button = OVC.getFullscreenButton(browser);
    button.click();
    browser.sleep(1000);
    browser.driver
      .manage()
      .window()
      .getSize()
      .then((value) => {
        expect(value.width === OVC.getVideo(browser).width && value.height === OVC.getVideo(browser).height);
        button.click();
        browser.driver
          .manage()
          .window()
          .getSize()
          .then((value2) => {
            expect(value2.width !== OVC.getVideo(browser).width && value2.height !== OVC.getVideo(browser).height);
          });
      });
  });

  it('should change the username', () => {
    browser.wait(EC.elementToBeClickable(OVC.getLocalNickname(browser)), 5000);
    OVC.getLocalNickname(browser).click();
    expect(OVC.getDialogNickname(browser).isDisplayed()).toBeTruthy();
    const inputDialog = OVC.getDialogNickname(browser).element(by.css('input'));
    inputDialog.clear();
    OVC.typeWithDelay(inputDialog, 'C');
    OVC.pressEnter(browser);
    browser.sleep(1000);
    expect(
      OVC.getLocalNickname(browser).getText(),
    ).toBe('C');
  });

  it('should close the session', () => {
    browser.wait(EC.elementToBeClickable(OVC.getLeaveButton(browser)), 5000);
    OVC.getLeaveButton(browser).click();
    expect(expect(browser.getCurrentUrl()).toMatch('/'));
  });
});

describe('Chat component', () => {
  const OVC = new OpenViduCall();
  const EC = protractor.ExpectedConditions;

  beforeEach(() => {
    browser.waitForAngularEnabled(false);
    return browser.get('#/codeURJC');
  });

  it('should send a message', () => {
    browser.wait(EC.elementToBeClickable(OVC.getChatButton(browser)), 5000);
    OVC.getChatButton(browser).click();
    browser.sleep(1500);
    OVC.getChatInput(browser).sendKeys('Message 1');
    browser
      .actions()
      .sendKeys(protractor.Key.ENTER)
      .perform();
    expect(OVC.getMessageList(browser).count()).toEqual(1);
    OVC.getChatButton(browser).click();
  });
});

describe('Two browsers: ', () => {
  const OVC = new OpenViduCall();
  const EC = protractor.ExpectedConditions;
  let browser2: ProtractorBrowser;

  beforeEach(() => {
    browser.waitForAngularEnabled(false);
    browser.get('#/codeURJC');
  });

  it('should connect a new user', () => {
    browser2 = OVC.openNewBrowserInTheSameRoom(browser);

    // avoid timeout waiting angular
    browser2.waitForAngularEnabled(false);

    browser.sleep(4000);
    expect(OVC.getVideoList(browser).count()).toEqual(2);
    OVC.closeSession(browser2);
  });

  it('a user should disconnect his WEBCAM and to be identified by other ', () => {
    browser2 = OVC.openNewBrowserInTheSameRoom(browser);

    // avoid timeout waiting angular
    browser2.ignoreSynchronization = true;
    browser.wait(EC.elementToBeClickable(OVC.getCamButton(browser)), 10000);
    OVC.getCamButton(browser).click();
    expect(OVC.getCamIcon(browser).isDisplayed()).toBeTruthy();
    expect(OVC.getCamIcon(browser2).isDisplayed()).toBeTruthy();
    OVC.closeSession(browser2);
  });

  it('a user should disconnect his MICROPHONE and to be identified by other ', () => {
    browser2 = OVC.openNewBrowserInTheSameRoom(browser);

    // avoid timeout waiting angular
    browser2.waitForAngularEnabled(false);

    browser.wait(EC.elementToBeClickable(OVC.getMicButton(browser)), 5000);
    OVC.getMicButton(browser).click();
    expect(OVC.getMicIcon(browser).isDisplayed()).toBeTruthy();
    expect(OVC.getMicIcon(browser2).isDisplayed()).toBeTruthy();
    OVC.closeSession(browser2);
  });

  it('a user should send a MESSAGE and to be identified by other ', () => {
    browser2 = OVC.openNewBrowserInTheSameRoom(browser);
    // avoid timeout waiting angular
    browser2.waitForAngularEnabled(false);

    browser.sleep(3000);
    browser.wait(EC.elementToBeClickable(OVC.getChatButton(browser)), 5000);
    OVC.getChatButton(browser).click();
    browser.wait(EC.visibilityOf(OVC.getChatContent(browser)), 5000);
    expect(OVC.getChatContent(browser).isDisplayed).toBeTruthy();
    browser.sleep(5000);
    OVC.getChatInput(browser).click();
    OVC.getChatInput(browser).sendKeys('New Message');
    OVC.pressEnter(browser);
    OVC.getChatButton(browser).click();
    expect(OVC.getNewMessagePoint(browser2).getText()).toBe('1');
    OVC.closeSession(browser2);
  });

  it('both users should can type messages and reveive its', () => {
    browser2 = OVC.openNewBrowserInTheSameRoom(browser);

    browser2.waitForAngularEnabled(false);

    OVC.getChatButton(browser).click();
    const input = OVC.getChatInput(browser);
    browser.sleep(2000);
    input.click();
    input.sendKeys('New Message User 1');
    OVC.pressEnter(browser);
    // OVC.getChatButton(browser).click();
    OVC.getChatButton(browser2).click();

    expect(OVC.getMessageList(browser2).count()).toEqual(1);
    const input2 = OVC.getChatInput(browser2);
    browser2.sleep(2000);
    input2.click();
    input2.sendKeys('Message User 2');
    OVC.pressEnter(browser2);
    expect(OVC.getMessageList(browser).count()).toEqual(4);
    OVC.closeSession(browser2);
  });

  it('user should can change his nickname and to be checked by other', () => {
    browser2 = OVC.openNewBrowserInTheSameRoom(browser);

    browser2.waitForAngularEnabled(false);
    browser.sleep(4000);
    OVC.getLocalNickname(browser).click();
    expect(OVC.getDialogNickname(browser).isDisplayed()).toBeTruthy();
    const inputDialog = OVC.getDialogNickname(browser).element(by.css('input'));
    inputDialog.click();
    inputDialog.clear();
    OVC.typeWithDelay(inputDialog, 'C');
    OVC.pressEnter(browser);
    browser.sleep(2000);
    expect(OVC.getRemoteNickname(browser2).getText()).toBe('C');
    OVC.closeSession(browser2);
  });
});
