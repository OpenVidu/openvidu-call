import { ParentMessage } from '../types/message.type';

/**
 * Handles sending messages to the iframe.
 */
export class CommandsManager {
	private iframe: HTMLIFrameElement;
	private allowedOrigin: string;

	constructor(iframe: HTMLIFrameElement, allowedOrigin: string) {
		this.iframe = iframe;
		this.allowedOrigin = allowedOrigin;
	}

	public sendMessage(message: ParentMessage, targetOrigin?: string): void {
		targetOrigin = targetOrigin || this.allowedOrigin;
		this.iframe.contentWindow?.postMessage(message, targetOrigin);
	}

	public setAllowedOrigin(newOrigin: string): void {
		this.allowedOrigin = newOrigin;
	}
}
