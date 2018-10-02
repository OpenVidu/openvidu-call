import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VideoRoomComponent } from './video-room/video-room.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: ':roomName', component: VideoRoomComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
