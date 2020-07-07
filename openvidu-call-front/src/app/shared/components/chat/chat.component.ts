import { Component, ElementRef, Input, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';
import { ChatMessage } from '../../types/chat-type';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
	selector: 'chat-component',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
	@ViewChild('chatScroll') chatScroll: ElementRef;
	@ViewChild('chatInput') chatInput: ElementRef;

	@Input() lightTheme: boolean;

	message: string;

	messageList: ChatMessage[] = [];
	chatOpened: boolean;

	private chatMessageSubscription: Subscription;
	private chatToggleSubscription: Subscription;

	constructor(private chatService: ChatService) {}

	@HostListener('document:keydown.escape', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		console.log(event);
		if (this.chatOpened) {
			this.close();
		}
	}

	ngOnInit() {
		this.subscribeToMessages();
		this.subscribeToToggleChat();
	}

	ngOnDestroy(): void {
		if (this.chatMessageSubscription) {
			this.chatMessageSubscription.unsubscribe();
		}
		if (this.chatToggleSubscription) {
			this.chatToggleSubscription.unsubscribe();
		}
	}

	eventKeyPress(event) {
		// Pressed 'Enter' key
		if (event && event.keyCode === 13) {
			this.sendMessage();
		}
	}

	sendMessage(): void {
		this.chatService.sendMessage(this.message);
		this.message = '';
	}

	scrollToBottom(): void {
		setTimeout(() => {
			try {
				this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
			} catch (err) {}
		}, 20);
	}

	close() {
		this.chatService.toggleChat();
	}

	private subscribeToMessages() {
		this.chatMessageSubscription = this.chatService.messagesObs.subscribe((messages: ChatMessage[]) => {
			this.messageList = messages;
			this.scrollToBottom();
		});
	}

	private subscribeToToggleChat() {
		this.chatToggleSubscription = this.chatService.toggleChatObs.subscribe((opened) => {
			this.chatOpened = opened;
			if (this.chatOpened) {
				this.scrollToBottom();
				setTimeout(() => {
					this.chatInput.nativeElement.focus();
				});
			}
		});
	}
}
