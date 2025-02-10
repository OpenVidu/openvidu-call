import { Routes } from '@angular/router';
import { HomeComponent } from '@app/pages/home/home.component';

import {
	RoomPreferencesComponent,
	AccessPermissionsComponent,
	AppearanceComponent,
	UnauthorizedComponent,
	ConsoleComponent,
	AboutComponent,
	SecurityPreferencesComponent,
	OverviewComponent,
	embeddedModeGuard,
	standaloneModeGuard,
	ensureValidTokenOrRoomNameGuard,
	VideoRoomComponent,
	ConsoleLoginComponent
} from 'shared-call-components';
export const routes: Routes = [
	// Embedded mode
	{
		path: 'embedded',
		component: VideoRoomComponent,
		canActivate: [embeddedModeGuard]
	},
	{ path: 'embedded/unauthorized', component: UnauthorizedComponent },

	{ path: '', component: VideoRoomComponent, canActivate: [standaloneModeGuard, ensureValidTokenOrRoomNameGuard] },
	{ path: 'home', component: HomeComponent, canActivate: [standaloneModeGuard] },
	{ path: 'login', component: ConsoleLoginComponent },
	{
		path: 'console',
		component: ConsoleComponent,
		canActivate: [standaloneModeGuard /* checkAdminTokenGuard */],
		children: [
			{ path: '', redirectTo: 'overview', pathMatch: 'full' },
			{ path: 'overview', component: OverviewComponent },
			{ path: 'access-permissions', component: AccessPermissionsComponent },
			{ path: 'appearance', component: AppearanceComponent },
			{ path: 'room-preferences', component: RoomPreferencesComponent },
			{ path: 'security-preferences', component: SecurityPreferencesComponent },
			{ path: 'about', component: AboutComponent },
			{ path: '**', redirectTo: 'overview' }
		]
	},
	{ path: 'unauthorized', component: UnauthorizedComponent },
	{ path: ':roomName', component: VideoRoomComponent, canActivate: [standaloneModeGuard, ensureValidTokenOrRoomNameGuard] },

	// Redirect all other routes to home
	{ path: '**', redirectTo: 'home' }
];
