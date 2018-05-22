import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog-nickname',
  templateUrl: './dialog-nickname.component.html',
  styleUrls: ['./dialog-nickname.component.css']
})
export class DialogNicknameComponent{

  constructor(public dialogRef: MatDialogRef<DialogNicknameComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
