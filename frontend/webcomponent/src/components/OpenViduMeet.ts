import { ParentMessage, WebComponentActionType } from '../types/message.type';
import { CommandsManager } from './CommandsManager';
import { EventsManager } from './EventsManager';

/**
 * The `OpenViduMeet` web component provides an interface for embedding an OpenVidu video call within an iframe.
 * It allows for dynamic configuration through attributes and provides methods to interact with the embedded call.
 *
 * @example
 * ```html
 * <openvidu-meet roomUrl="https://your-openvidu-server.com/room"></openvidu-meet>
 * ```
 *
 * @attribute roomUrl - The base URL of the OpenVidu Meet room. This attribute is required.
 *
 * @public
 */
export class OpenViduMeet extends HTMLElement {
	/**
	 * A reference to the HTML iframe element used within the OpenViduMeet component.
	 * This iframe is likely used to embed external content or another web page.
	 *
	 * @private
	 * @type {HTMLIFrameElement}
	 */
	private iframe: HTMLIFrameElement;
	private commandsManager: CommandsManager;
	private eventsManager: EventsManager;
	private allowedOrigin: string = '*';

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.iframe = document.createElement('iframe');
		this.iframe.setAttribute(
			'allow',
			'camera; microphone; display-capture; fullscreen; autoplay; compute-pressure;'
		);

		this.commandsManager = new CommandsManager(this.iframe, this.allowedOrigin);
		this.eventsManager = new EventsManager(this);

		// Listen for changes in attributes to update the iframe src
		const observer = new MutationObserver(() => this.updateIframeSrc());
		observer.observe(this, { attributes: true });
	}

	connectedCallback() {
		this.render();
		this.eventsManager.listen();
		this.updateIframeSrc();
	}

	private render() {
		const style = document.createElement('style');
		style.textContent = `
		:host {
			display: block;
			width: 100%;
			height: 100%;
		}
		  iframe {
			width: 100%;
			height: 100%;
			border: none;
		  }
		`;
		this.shadowRoot?.appendChild(style);
		this.shadowRoot?.appendChild(this.iframe);
		this.iframe.onload = () => {
			const message: ParentMessage = {
				action: WebComponentActionType.INITIALIZE,
				payload: { domain: window.location.origin }
			};
			this.commandsManager.sendMessage(message);
			this.iframe.onload = null;
		};
	}

	private updateIframeSrc() {
		const baseUrl = this.getAttribute('room-url') || '';
		if (!baseUrl) {
			console.error('The "room-url" attribute is required.');
			return;
		}

		const url = new URL(baseUrl);
		this.allowedOrigin = url.origin;
		this.commandsManager.setAllowedOrigin(this.allowedOrigin);

		// Update query params
		Array.from(this.attributes).forEach((attr) => {
			if (attr.name !== 'room-url') {
				url.searchParams.set(attr.name, attr.value);
			}
		});

		this.iframe.src = url.toString();
	}

	// Public methods

	public endMeeting() {
		const message: ParentMessage = { action: WebComponentActionType.END_MEETING };
		this.commandsManager.sendMessage(message);
	}

	public leaveRoom() {
		const message: ParentMessage = { action: WebComponentActionType.LEAVE_ROOM };
		this.commandsManager.sendMessage(message);
	}

	public toggleChat() {
		const message: ParentMessage = { action: WebComponentActionType.TOGGLE_CHAT };
		this.commandsManager.sendMessage(message);
	}
}
