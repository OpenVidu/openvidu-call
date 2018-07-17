import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { UserModel } from '../../models/user-model';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
})
export class ToolbarComponent implements OnInit {

  @Input() lightTheme: boolean;
  @Input() mySessionId: boolean;
  @Input() localUser: UserModel;
  @Input() compact: boolean;
  @Input() showNotification: boolean;

  @Output() micButtonClicked = new EventEmitter<any>();
  @Output() camButtonClicked = new EventEmitter<any>();
  @Output() screenShareClicked = new EventEmitter<any>();
  @Output() exitButtonClicked = new EventEmitter<any>();
  @Output() chatButtonClicked = new EventEmitter<any>();
  @Output() screenShareDisabledClicked = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {}

  micStatusChanged() {
    this.micButtonClicked.emit();
  }

  camStatusChanged() {
    this.camButtonClicked.emit();
  }

  screenShare() {
    this.screenShareClicked.emit();
  }

  screenShareDisabled() {
    this.screenShareDisabledClicked.emit();
  }

  exitSession() {
    this.exitButtonClicked.emit();
  }

  toggleChat() {
    this.chatButtonClicked.emit();
  }
}
