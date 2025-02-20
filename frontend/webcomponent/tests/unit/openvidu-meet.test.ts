import { describe, it, expect, jest } from '@jest/globals';
import { WEBCOMPONENT_ROOM_URL } from '../config';
import { OpenViduMeet } from '../../src/components/OpenViduMeet';
import { EventsManager } from '../../src/components/EventsManager';
import '../../src/index';
import { WebComponentActionType } from '../../src/types/message.type';

describe('OpenVidu Meet Web Component Attributes', () => {
	let component: OpenViduMeet;

	beforeEach(() => {
		component = document.createElement('openvidu-meet') as OpenViduMeet;
		document.body.appendChild(component);
	});

	afterEach(() => {
		document.body.removeChild(component);
		document.body.innerHTML = '';
	});

	test('should be created correctly', () => {
		expect(component).toBeDefined();
		expect(component.shadowRoot).not.toBeNull();
	});

	test('should render iframe with correct attributes', () => {
		const iframe = component.shadowRoot?.querySelector('iframe');
		expect(iframe).not.toBeNull();
		expect(iframe?.getAttribute('allow')).toContain('camera');
		expect(iframe?.getAttribute('allow')).toContain('microphone');
		expect(iframe?.getAttribute('allow')).toContain('fullscreen');
		expect(iframe?.getAttribute('allow')).toContain('display-capture');
	});

	test('should reject rendering iframe when "room-url" attribute is missing', () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

		// Trigger updateIframeSrc manually
		(component as any).updateIframeSrc();

		const iframe = component.shadowRoot?.querySelector('iframe');

		expect(iframe).toBeDefined();
		expect(iframe?.src).toBeFalsy();
		expect(consoleErrorSpy).toHaveBeenCalledWith('The "room-url" attribute is required.');

		consoleErrorSpy.mockRestore();
	});

	test('should update iframe src when "room-url" attribute changes', () => {
		component.setAttribute('room-url', WEBCOMPONENT_ROOM_URL);
		component.setAttribute('user', 'testUser');

		// Manually trigger the update (MutationObserver doesn't always trigger in tests)
		(component as any).updateIframeSrc();

		const iframe = component.shadowRoot?.querySelector('iframe');
		expect(iframe?.src).toEqual(`${WEBCOMPONENT_ROOM_URL}?user=testUser`);
	});
});

describe('OpenViduMeet Web Component Events Listener', () => {
	let component: OpenViduMeet;
	let eventsManager: EventsManager;
	const allowedOrigin = 'http://example.com';

	beforeEach(() => {
		component = document.createElement('openvidu-meet') as OpenViduMeet;
		eventsManager = new EventsManager(component);
		document.body.appendChild(component);
	});

	afterEach(() => {
		document.body.removeChild(component);
		document.body.innerHTML = '';
	});

	test('should be created correctly', () => {
		expect(component).toBeDefined();
		expect(component.shadowRoot).not.toBeNull();
	});

	it('should listen for messages', () => {
		const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
		eventsManager.listen();
		expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
	});

	it('should handle messages from allowed origin', () => {
		const dispatchEventSpy = jest.spyOn(component, 'dispatchEvent');
		const event = new MessageEvent('message', {
			origin: allowedOrigin,
			data: { type: 'someType', eventType: 'someEventType' }
		});

		(eventsManager as any).handleMessage(event);

		expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
		expect(dispatchEventSpy.mock.calls[0][0].type).toBe('someEventType');
	});

	it('should ignore invalid messages', () => {
		const dispatchEventSpy = jest.spyOn(component, 'dispatchEvent');
		const event = new MessageEvent('message', {
			origin: allowedOrigin,
			data: { invalid: 'data' }
		});

		(eventsManager as any).handleMessage(event);

		expect(dispatchEventSpy).not.toHaveBeenCalled();
	});

	// TODO: Add test for leave room event
});

describe('OpenViduMeet Web Component Commands', () => {
	let component: OpenViduMeet;

	beforeEach(() => {
		component = document.createElement('openvidu-meet') as OpenViduMeet;
		document.body.appendChild(component);
	});

	afterEach(() => {
		document.body.removeChild(component);
		jest.restoreAllMocks();
		document.body.innerHTML = '';
	});

	test('should be created correctly', () => {
		expect(component).toBeDefined();
		expect(component.shadowRoot).not.toBeNull();
	});

	test('should call sendMessage only once when iframe loads', () => {
		const sendMessageSpy = jest.spyOn(component['commandsManager'], 'sendMessage');

		const iframe = component.shadowRoot?.querySelector('iframe');
		expect(iframe).not.toBeNull();

		// Simular la primera carga del iframe
		iframe?.dispatchEvent(new Event('load'));

		expect(sendMessageSpy).toHaveBeenCalledTimes(1);
		expect(sendMessageSpy).toHaveBeenCalledWith({
			action: WebComponentActionType.INITIALIZE,
			payload: { domain: window.location.origin }
		});

		// Intentar disparar el evento nuevamente
		iframe?.dispatchEvent(new Event('load'));

		// No debería llamarse nuevamente
		expect(sendMessageSpy).toHaveBeenCalledTimes(1);
	});

	test('should call commandsManager.sendMessage when leaveRoom is called', () => {
		const spy = jest.spyOn(component['commandsManager'], 'sendMessage');
		component.leaveRoom();
		expect(spy).toHaveBeenCalledWith({ action: WebComponentActionType.LEAVE_ROOM });
	});

	test('should call commandsManager.sendMessage when toggleChat is called', () => {
		const spy = jest.spyOn(component['commandsManager'], 'sendMessage');
		component.toggleChat();
		expect(spy).toHaveBeenCalledWith({ action: WebComponentActionType.TOGGLE_CHAT });
	});
});
