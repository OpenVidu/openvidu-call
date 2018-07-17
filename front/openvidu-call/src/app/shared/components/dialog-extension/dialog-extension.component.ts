import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialog-extension',
  templateUrl: './dialog-extension.component.html',
  styleUrls: ['./dialog-extension.component.css'],
})
export class DialogExtensionComponent implements OnInit {

  @Input() nickname = '';
  @Output() cancel = new EventEmitter<any>();

  openviduExtensionUrl = 'https://chrome.google.com/webstore/detail/openvidu-screensharing/lfcgfepafnobdloecchnfaclibenjold';
  isInstalled: boolean;

  constructor() {}

  ngOnInit() {}

  onNoClick(): void {
    this.cancel.emit();
  }

  goToChromePage(): void {
    window.open(this.openviduExtensionUrl);
    this.isInstalled = true;
  }

  refreshBrowser(): void {
    window.location.reload();
  }
}
