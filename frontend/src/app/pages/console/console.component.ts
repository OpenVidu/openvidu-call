import { Component, OnInit } from '@angular/core';
import { ConsoleNavComponent, ConsoleNavLink, HttpService } from 'shared-call-components';

@Component({
	selector: 'app-console',
	standalone: true,
	imports: [ConsoleNavComponent],
	templateUrl: './console.component.html',
	styleUrl: './console.component.scss'
})
export class ConsoleComponent implements OnInit {
	navLinks: ConsoleNavLink[] = [
		{ label: 'Overview', route: '/', icon: 'dashboard' },
		{ label: 'Appearance', route: 'appearance', icon: 'palette' },
		{ label: 'Access & Permissions', route: 'access', icon: 'lock' },
		{ label: 'Room Config', route: 'room-config', icon: 'video_settings' },
		{ label: 'Security', route: 'security', icon: 'security' },
		{ label: 'Integrations', route: 'integrations', icon: 'integration_instructions' },
		{ label: 'Support', route: 'support', icon: 'support' },
		{ label: 'About', route: 'about', icon: 'info' }
	];

	constructor(private httpService: HttpService) {}

	async ngOnInit() {
		const globalPreferences = await this.httpService.getGlobalPreferences();
		console.log(globalPreferences);
	}

	logout() {
		console.log('logout');
	}
}
