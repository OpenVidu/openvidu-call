import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { trigger, style, transition, animate, state } from '@angular/animations';
import { UserModel } from '../../models/user-model';

@Component({
  selector: 'chat-component',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  animations: [
    trigger('toggleChat', [
      state(
        'hidden',
        style({
          opacity: '0',
          overflow: 'hidden',
          display: 'none',
        }),
      ),
      state(
        'shown',
        style({
          opacity: '1',
        }),
      ),
      transition('* => *', animate('100ms ease-in')),
    ]),
  ],
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('chatScroll') chatScroll: ElementRef;

  @Input() user: UserModel;

  visibility = 'hidden';
  message: string;
  messageUnread = false;

  messageList: { connectionId: string; nickname: string; message: string }[] = [];

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.user.stream.session.on('signal:chat', (event: any) => {
      const data = JSON.parse(event.data);
      this.messageList.push({ connectionId: event.from.connectionId, nickname: data.nickname, message: data.message });
      this.messageUnread = this.visibility === 'hidden';
      this.scrollToBottom();
    });
  }

  toggle(): void {
    this.visibility = this.visibility === 'hidden' ? 'shown' : 'hidden';
    this.messageUnread = false;
    this.scrollToBottom();

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
        const data = { message: this.message, nickname: this.user.nickname };
        this.user.stream.session.signal({
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
}
