import { Component, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'app-dialog-choose-room',
  templateUrl: './dialog-choose-room.component.html',
  styleUrls: ['./dialog-choose-room.component.css'],
})
export class DialogChooseRoomComponent implements OnInit {

  PUBLISHER = 'PUBLISHER';
  SUBSCRIBER = 'SUBSCRIBER';

  @Output() close = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {}

  closeDialog(role: string): void {
    this.close.emit(role);
  }
}
