import { Routes } from '@angular/router';

import { UnauthorizedComponent } from '../components';
import { embeddedModeGuard, standaloneModeGuard, ensureValidTokenOrRoomNameGuard, redirectUrlGuard } from '../guards';
import {
	AboutComponent,
	AccessPermissionsComponent,
	AppearanceComponent,
	ConsoleComponent,
	ConsoleLoginComponent,
	OverviewComponent,
	RoomPreferencesComponent,
	SecurityPreferencesComponent,
	VideoRoomComponent
} from '../pages';

export const baseRoutes: Routes = [
	// Embedded mode
	{
		path: 'embedded',
		component: VideoRoomComponent,
		canActivate: [embeddedModeGuard, redirectUrlGuard]
	},
	{ path: 'embedded/unauthorized', component: UnauthorizedComponent },

	{ path: '', component: VideoRoomComponent, canActivate: [standaloneModeGuard, ensureValidTokenOrRoomNameGuard, redirectUrlGuard] },
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
	{
		path: ':roomName',
		component: VideoRoomComponent,
		canActivate: [standaloneModeGuard, ensureValidTokenOrRoomNameGuard, redirectUrlGuard]
	},

	// Redirect all other routes to home
	{ path: '**', redirectTo: 'home' }
];
