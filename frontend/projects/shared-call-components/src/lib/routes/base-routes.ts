import { Routes } from '@angular/router';

import { UnauthorizedComponent } from '../components';
import {
	checkAdminAuthenticatedGuard,
	checkAdminNotAuthenticatedGuard,
	validateRoomAccessGuard,
	applicationModeGuard,
	extractQueryParamsGuard,
	checkParticipantNameGuard
} from '../guards';
import {
	AboutComponent,
	AccessPermissionsComponent,
	AppearanceComponent,
	ConsoleComponent,
	ConsoleLoginComponent,
	DisconnectedComponent,
	OverviewComponent,
	ParticipantNameFormComponent,
	RoomPreferencesComponent,
	SecurityPreferencesComponent,
	VideoRoomComponent
} from '../pages';

export const baseRoutes: Routes = [
	{ path: 'disconnected', component: DisconnectedComponent },
	{ path: 'unauthorized', component: UnauthorizedComponent },
	{
		path: 'console/login',
		component: ConsoleLoginComponent,
		canActivate: [checkAdminNotAuthenticatedGuard]
	},
	{
		path: 'console',
		component: ConsoleComponent,
		canActivate: [/*standaloneModeGuard*/ checkAdminAuthenticatedGuard],
		children: [
			{
				path: '',
				redirectTo: 'overview',
				pathMatch: 'full'
			},
			{
				path: 'overview',
				component: OverviewComponent
			},
			{
				path: 'access-permissions',
				component: AccessPermissionsComponent
			},
			{
				path: 'appearance',
				component: AppearanceComponent
			},
			{
				path: 'room-preferences',
				component: RoomPreferencesComponent
			},
			{
				path: 'security-preferences',
				component: SecurityPreferencesComponent
			},
			{
				path: 'about',
				component: AboutComponent
			},
			{ path: '**', redirectTo: 'overview' }
		]
	},
	{
		path: ':room-name',
		component: VideoRoomComponent,
		canActivate: [applicationModeGuard, extractQueryParamsGuard, checkParticipantNameGuard, validateRoomAccessGuard],
	},
	{
		path: ':room-name/participant-name',
		component: ParticipantNameFormComponent,
	},

	// Redirect all other routes to home
	{ path: '**', redirectTo: 'home' }
];
