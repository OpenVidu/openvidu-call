import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, HostListener } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { Session } from 'openvidu-browser';

@Component({
  selector: 'chat-component',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {

  @ViewChild('chatScroll') chatScroll: ElementRef;
  @ViewChild('chatInput') chatInput: ElementRef;

  @Input() session: Session;
  @Input() user: UserModel;
  @Input() lightTheme: boolean;
  @Input()
  messageList: { connectionId: string; nickname: string; message: string; userAvatar: string }[] = [];

  _chatDisplay: 'block' | 'none';

  @Output() closeChat = new EventEmitter<any>();

  message: string;

  constructor() {}

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    console.log(event);
    if (this._chatDisplay === 'block') {
      this.close();
    }
  }

  ngOnInit() {}

  @Input('chatDisplay')
  set isDisplayed(display: 'block' | 'none') {
    this._chatDisplay = display;

    if (this._chatDisplay === 'block') {
      this.scrollToBottom();
      setTimeout(() => {
        this.chatInput.nativeElement.focus();
      });
    }
  }

  eventKeyPress(event) {
    if (event && event.keyCode === 13) {
      // Press Enter
      this.sendMessage();
    }
  }

  sendMessage(): void {
    if (this.user && this.message) {
      this.message = this.message.replace(/ +(?= )/g, '');
      if (this.message !== '' && this.message !== ' ') {
        const data = {
          connectionId: this.user.getConnectionId(),
          message: this.message,
          nickname: this.user.getNickname(),
        };
        this.session.signal({
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
