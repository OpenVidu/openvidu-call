import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog-extension',
  templateUrl: './dialog-extension.component.html',
  styleUrls: ['./dialog-extension.component.css'],
})
export class DialogExtensionComponent implements OnInit {

  openviduExtensionUrl = 'https://chrome.google.com/webstore/detail/openvidu-screensharing/lfcgfepafnobdloecchnfaclibenjold';
  isInstalled: boolean;

  constructor(public dialogRef: MatDialogRef<DialogExtensionComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  goToChromePage(): void {
    window.open(this.openviduExtensionUrl);
    this.isInstalled = true;
  }

  refreshBrowser(): void {
    window.location.reload();
  }
}
