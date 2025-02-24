import { Routes } from '@angular/router';

import { UnauthorizedComponent } from '../components';
import { embeddedModeGuard, standaloneModeGuard, ensureValidTokenOrRoomNameGuard, redirectUrlGuard, ensureValidRoomGuard } from '../guards';
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
	// {
	// 	path: 'embedded',
	// 	component: VideoRoomComponent,
	// 	canActivate: [embeddedModeGuard, redirectUrlGuard]
	// },
	// { path: 'embedded/unauthorized', component: UnauthorizedComponent },
	// {
	// 	path: '',
	// 	component: VideoRoomComponent,
	// 	canActivate: [standaloneModeGuard, ensureValidTokenOrRoomNameGuard, redirectUrlGuard]
	// },
	{ path: 'unauthorized', component: UnauthorizedComponent },
	{ path: 'console/login', component: ConsoleLoginComponent },
	{
		path: 'console',
		component: ConsoleComponent,
		canActivate: [
			/*standaloneModeGuard  checkAdminTokenGuard */
		],
		children: [
			{
				path: '',
				redirectTo: 'overview',
				pathMatch: 'full'
			},
			{
				path: 'overview',
				component: OverviewComponent,
				canActivate: [
					/*checkAdminTokenGuard*/
				]
			},
			{
				path: 'access-permissions',
				component: AccessPermissionsComponent,
				canActivate: [
					/*checkAdminTokenGuard*/
				]
			},
			{
				path: 'appearance',
				component: AppearanceComponent,
				canActivate: [
					/*checkAdminTokenGuard*/
				]
			},
			{
				path: 'room-preferences',
				component: RoomPreferencesComponent,
				canActivate: [
					/*checkAdminTokenGuard*/
				]
			},
			{
				path: 'security-preferences',
				component: SecurityPreferencesComponent,
				canActivate: [
					/*checkAdminTokenGuard*/
				]
			},
			{
				path: 'about',
				component: AboutComponent,
				canActivate: [
					/*checkAdminTokenGuard*/
				]
			},
			{ path: '**', redirectTo: 'overview' }
		]
	},
	{
		path: ':roomName',
		component: VideoRoomComponent,
		canActivate: [/*standaloneModeGuard,*/ ensureValidRoomGuard, redirectUrlGuard]
	},

	// Redirect all other routes to home
	{ path: '**', redirectTo: 'home' }
];
