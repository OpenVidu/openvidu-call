import { Routes } from '@angular/router';
import { HomeComponent } from '@app/pages/home/home.component';
import { VideoRoomComponent } from '@app/pages/video-room/video-room.component';
import { ConsoleComponent } from '@app/pages/console/console.component';
import { roomGuard } from '@app/guards/room.guard';
import { embeddedGuard } from '@app/guards/embedded.guard';
import { AppearanceComponent } from '@app/pages/console/appearance/appearance.component';
import { RoomConfigComponent } from '@app/pages/console/room-config/room-config.component';
import { nonEmbeddedGuard } from './guards/non-embedded.guard';
import { UnauthorizedComponent } from 'shared-call-components';
export const routes: Routes = [
	{ path: '', redirectTo: 'console', pathMatch: 'full' },
	{ path: 'home', component: HomeComponent, canActivate: [nonEmbeddedGuard] },
	{
		path: 'console',
		component: ConsoleComponent,
		canActivate: [nonEmbeddedGuard],
		children: [
			{ path: 'appearance', component: AppearanceComponent },
			{ path: 'room-config', component: RoomConfigComponent }
		]
	},
	{ path: 'unauthorized', component: UnauthorizedComponent },
	{ path: ':roomName', component: VideoRoomComponent, canActivate: [roomGuard] },
	// Embedded mode
	{ path: 'embedded', component: VideoRoomComponent, canActivate: [embeddedGuard] },
	{ path: 'embedded/unauthorized', component: UnauthorizedComponent }
];
