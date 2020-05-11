import { async, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';

import { WebComponentComponent } from './web-component.component';
import { LoggerService } from '../shared/services/logger/logger.service';
import { LoggerServiceMock } from '../shared/services/logger/logger.service.mock';

class OVSESSION {
	on(event: string, callback) {}
}
describe('WebComponentComponent unit test', () => {
	let component: WebComponentComponent;
	let fixture: ComponentFixture<WebComponentComponent>;
	const session = new OVSESSION();

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [WebComponentComponent],
			providers: [{ provide: LoggerService, useClass: LoggerServiceMock }]
		}).compileComponents();
		fixture = TestBed.createComponent(WebComponentComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should assign the default theme ', () => {
		expect(component.webComponent.getTheme()).toEqual('dark');
	});

	it('should assign the light theme ', () => {
		component.theme = 'light';
		expect(component.webComponent.getTheme()).toEqual('light');
	});

	it('should assign the default theme with unsupported theme', () => {
		component.theme = 'orange';
		expect(component.webComponent.getTheme()).toEqual('dark');
	});

	it('should assign openvidu secret ', () => {
		component.openviduSecret = 'secret';
		expect(component.webComponent.getOvSecret()).toEqual('secret');
	});

	it('should assign openvidu url ', () => {
		component.openviduServerUrl = 'openvidu';
		expect(component.webComponent.getOvServerUrl()).toEqual('openvidu');
	});

	it('should not initialize session with an empty Object sessionConfig', fakeAsync(() => {
		component.sessionConfig = {};
		flush();
		expect(component.webComponent.getSessionName()).toBeUndefined();
		expect(component.webComponent.getNickname()).toBeUndefined();
		expect(component.webComponent.getTokens()).toBeUndefined();
		expect(component.display).toBeFalsy();
	}));

	it('should not initialize session with an empty string sessionConfig', fakeAsync(() => {
		component.sessionConfig = '';
		flush();
		expect(component.webComponent.getSessionName()).toBeUndefined();
		expect(component.webComponent.getNickname()).toBeUndefined();
		expect(component.webComponent.getTokens()).toBeUndefined();
		expect(component.display).toBeFalsy();
	}));

	it('should not initialize session with empty tokens and nickname', fakeAsync(() => {
		component.sessionConfig = '{"tokens": [], "user": "nickname"}';
		flush();
		expect(component.webComponent.getSessionName()).toBeUndefined();
		expect(component.webComponent.getNickname()).toEqual('nickname');
		expect(component.webComponent.getTokens()).toEqual([]);
		expect(component.display).toBeFalsy();
	}));

	it('should not initialize session with one token and without nickname', fakeAsync(() => {
		component.sessionConfig = '{"tokens": ["token1"]}';
		flush();
		expect(component.webComponent.getSessionName()).toBeUndefined();
		expect(component.webComponent.getNickname()).toBeUndefined();
		expect(component.webComponent.getTokens()).toEqual(['token1']);
		expect(component.display).toBeFalsy();
	}));

	it('should not initialize session with two tokens and without nickname', fakeAsync(() => {
		component.sessionConfig = '{"tokens": ["token1", "token2"]}';
		flush();
		expect(component.webComponent.getSessionName()).toBeUndefined();
		expect(component.webComponent.getNickname()).toBeUndefined();
		expect(component.webComponent.getTokens()).toEqual(['token1', 'token2']);
		expect(component.display).toBeFalsy();
	}));

	it('should initialize session with one token and nickname', fakeAsync(() => {
		component.sessionConfig = '{"tokens": ["token"], "user": "nickname"}';
		flush();
		expect(component.webComponent.getSessionName()).toBeUndefined();
		expect(component.webComponent.getNickname()).toEqual('nickname');
		expect(component.webComponent.getTokens()).toEqual(['token']);
		expect(component.display).toBeTruthy();
	}));

	it('should initialize session with two tokens and nickname', fakeAsync(() => {
		component.sessionConfig = '{"tokens": ["token1", "token2"], "user": "nickname"}';
		flush();
		expect(component.webComponent.getSessionName()).toBeUndefined();
		expect(component.webComponent.getNickname()).toEqual('nickname');
		expect(component.webComponent.getTokens()).toEqual(['token1', 'token2']);
		expect(component.display).toBeTruthy();
	}));

	it('should not initialize session without sessionName', fakeAsync(() => {
		component.openviduSecret = 'secret';
		component.openviduServerUrl = 'url';
		component.sessionConfig = '{"user": "nickname"}';
		flush();
		expect(component.webComponent.getOvServerUrl()).toEqual('url');
		expect(component.webComponent.getOvSecret()).toEqual('secret');
		expect(component.webComponent.getSessionName()).toBeUndefined();
		expect(component.webComponent.getNickname()).toEqual('nickname');
		expect(component.webComponent.getTokens()).toBeUndefined();
		expect(component.display).toBeFalsy();
	}));

	it('should not initialize session without openvidu url', fakeAsync(() => {
		component.openviduSecret = 'secret';
		component.sessionConfig = '{"sessionName": "sessionName", "user": "nickname"}';
		flush();
		expect(component.webComponent.getOvServerUrl()).toBeUndefined();
		expect(component.webComponent.getOvSecret()).toEqual('secret');
		expect(component.webComponent.getSessionName()).toEqual('sessionName');
		expect(component.webComponent.getNickname()).toEqual('nickname');
		expect(component.webComponent.getTokens()).toBeUndefined();
		expect(component.display).toBeFalsy();
	}));

	it('should not initialize session without openvidu secret', fakeAsync(() => {
		component.openviduServerUrl = 'url';
		component.sessionConfig = '{"sessionName": "sessionName", "user": "nickname"}';
		flush();
		expect(component.webComponent.getOvServerUrl()).toEqual('url');
		expect(component.webComponent.getOvSecret()).toBeUndefined();
		expect(component.webComponent.getSessionName()).toEqual('sessionName');
		expect(component.webComponent.getNickname()).toEqual('nickname');
		expect(component.webComponent.getTokens()).toBeUndefined();
		expect(component.display).toBeFalsy();
	}));

	it('should not initialize session without nickname', fakeAsync(() => {
		component.openviduServerUrl = 'url';
		component.sessionConfig = '{"sessionName": "sessionName"}';
		flush();
		expect(component.webComponent.getOvServerUrl()).toEqual('url');
		expect(component.webComponent.getOvSecret()).toBeUndefined();
		expect(component.webComponent.getSessionName()).toEqual('sessionName');
		expect(component.webComponent.getNickname()).toBeUndefined();
		expect(component.webComponent.getTokens()).toBeUndefined();
		expect(component.display).toBeFalsy();
	}));

	it('should disable screenshare button with one token', fakeAsync(() => {
		component.sessionConfig = '{"tokens": ["token"], "user": "nickname"}';
		flush();
		expect(component.webComponent.getOvSettings().hasScreenSharing()).toBeFalsy();
		expect(component.display).toBeTruthy();
	}));

	it('should emit an error when emitErrorEvent is called', fakeAsync(() => {
		spyOn(component.error, 'emit');
		component.emitErrorEvent('');
		flush();
		expect(component.error.emit).toHaveBeenCalled();
	}));

	it('should emit a session when emitSession is called', fakeAsync(() => {
		spyOn(component.sessionCreated, 'emit');
		component.emitSession(session);
		expect(component.sessionCreated.emit).toHaveBeenCalled();
	}));

	it('should emit a publisher when emitPublisher is called', fakeAsync(() => {
		spyOn(component.publisherCreated, 'emit');
		component.emitPublisher(null);
		expect(component.publisherCreated.emit).toHaveBeenCalled();
	}));

	// it('should initialize the session and leave it', fakeAsync(() => {
	// 	component.videoRoom = jasmine.createSpyObj('component.videoRoom', {
	// 		leaveSession: component.emitLeaveSessionEvent(session)
	// 	});

	// 	const emitLeaveSessionEventSpy = spyOn(component, 'emitLeaveSessionEvent').and.callThrough();

	// 	spyOn(session, 'on').and.callFake((event: string, callback) => {
	// 		if (event === 'sessionDisconnected') {
	// 		  callback();
	// 		}
	// 	  });
	// 	component.sessionConfig = '{"tokens": ["token"], "user": "nickname"}';
	// 	flush();

	// 	expect(component.webComponent.getSessionName()).toBeUndefined();
	// 	expect(component.webComponent.getNickname()).toEqual('nickname');
	// 	expect(component.webComponent.getTokens()).toEqual(['token']);
	// 	expect(component.display).toBeTruthy();
	// 	component.sessionConfig = {};
	// 	flush();
	// 	expect(component.videoRoom.leaveSession).toHaveBeenCalled();
	// 	component.videoRoom.leaveSession();
	// 	flush();
	// 	expect(emitLeaveSessionEventSpy).toHaveBeenCalled();

	// 	expect(component.display).toBeFalsy();
	// }));
});
