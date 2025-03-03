import { Component } from '@angular/core';
import { ConsoleNavComponent } from '../../components/console-nav/console-nav.component';
import { ConsoleNavLink } from '../../models/sidenav.model';
import { AuthService } from '../../services';

@Component({
	selector: 'app-console',
	standalone: true,
	imports: [ConsoleNavComponent],
	templateUrl: './console.component.html',
	styleUrl: './console.component.scss'
})
export class ConsoleComponent {
	navLinks: ConsoleNavLink[] = [
		{ label: 'Overview', route: 'overview', icon: 'dashboard' },
		{ label: 'Rooms', route: 'room-preferences', icon: 'video_settings' },
		{ label: 'Recordings', route: 'recordings', icon: 'radio_button_checked' }
		// { label: 'Access & Permissions', route: 'access-permissions', icon: 'lock' },
		// { label: 'Appearance', route: 'appearance', icon: 'palette' },
		// { label: 'Security', route: 'security-preferences', icon: 'security' },
		// { label: 'About', route: 'about', icon: 'info' }
	];

	constructor(private authService: AuthService) {}

	async logout() {
		await this.authService.adminLogout();
	}
}
