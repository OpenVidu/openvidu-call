import { Component, OnInit, Input, Output, AfterViewInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { UserModel } from '../../models/user-model';

@Component({
  selector: 'chat-component',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('chatScroll') chatScroll: ElementRef;

  @Input() user: UserModel;
  _chatDisplay: 'block' | 'none';
  @Input() lightTheme: boolean;
  @Output() messageReceived = new EventEmitter<any>();
  @Output() closeChat = new EventEmitter<any>();

  message: string;
  messageList: { connectionId: string; nickname: string; message: string }[] = [];

  constructor() {}

  ngOnInit() {}

  @Input('chatDisplay')
  set isDisplayed(display: 'block' | 'none') {
    this._chatDisplay = display;
    if (this._chatDisplay === 'block') {
      this.scrollToBottom();
    }
  }

  ngAfterViewInit() {
    this.user.getStreamManager().stream.session.on('signal:chat', (event: any) => {
      const data = JSON.parse(event.data);
      this.messageList.push({ connectionId: event.from.connectionId, nickname: data.nickname, message: data.message });
      this.messageReceived.emit();
      this.scrollToBottom();
    });
  }

  eventKeyPress(event) {
    if (event && event.keyCode === 13) {
      this.sendMessage();
    }
  }

  sendMessage(): void {
    if (this.user && this.message) {
      this.message = this.message.replace(/ +(?= )/g, '');
      if (this.message !== '' && this.message !== ' ') {
        const data = { message: this.message, nickname: this.user.getNickname() };
        this.user.getStreamManager().stream.session.signal({
          data: JSON.stringify(data),
          type: 'chat',
        });
        this.message = '';
      }
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
      } catch (err) {}
    }, 20);
  }

  close() {
    this.closeChat.emit();
  }
}
