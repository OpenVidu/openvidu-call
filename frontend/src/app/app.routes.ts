import { Routes } from '@angular/router';
import { HomeComponent } from '@app/pages/home/home.component';
import { baseRoutes } from 'shared-call-components';

export const routes: Routes = [
	{ path: 'home', component: HomeComponent, /*canActivate: [standaloneModeGuard]*/ },
	...baseRoutes
];
