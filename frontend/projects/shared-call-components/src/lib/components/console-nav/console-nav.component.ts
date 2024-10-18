import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { ConsoleNavLink } from '../../models/sidenav.model';

@Component({
	selector: 'ov-console-nav',
	standalone: true,
	imports: [CommonModule, MatToolbarModule, MatListModule, MatButtonModule, MatIconModule, MatSidenavModule, RouterModule],
	templateUrl: './console-nav.component.html',
	styleUrl: './console-nav.component.scss'
})
export class ConsoleNavComponent {
	@ViewChild(MatSidenav) sidenav!: MatSidenav;
	isMobile = false;
	isTablet = false;
	isSideMenuCollapsed = false;
	@Input() navLinks: ConsoleNavLink[] = [];

	@Output() onLogoutClicked: EventEmitter<void> = new EventEmitter<void>();

	async toggleSideMenu() {
		if (this.isMobile) {
			this.isSideMenuCollapsed = false;
			await this.sidenav.toggle();
		} else {
			this.isSideMenuCollapsed = !this.isSideMenuCollapsed;
			await this.sidenav.open();
		}
	}
}
