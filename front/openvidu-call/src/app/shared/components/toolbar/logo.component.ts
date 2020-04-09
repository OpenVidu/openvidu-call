import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-toolbar-logo',
	template: `
		<div id="navSessionInfo">
			<a>
				<img id="header_img" alt="OpenVidu Logo" [src]="logoUrl" />
			</a>
			<div *ngIf="!compact && sessionId" [ngClass]="{'titleContent': true, 'titleContentLight': lightTheme, 'titleContentDark': !lightTheme}">
				<span id="session-title">{{ sessionId }}</span>
			</div>
		</div>
	`,
	styleUrls: ['./toolbar.component.css']
})
export class ToolbarLogoComponent {
	@Input() lightTheme: boolean;
	@Input() compact: boolean;
	@Input() sessionId: string;
	@Input() logoUrl: string;

	constructor() {}
}
