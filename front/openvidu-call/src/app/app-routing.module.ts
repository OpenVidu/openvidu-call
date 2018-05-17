import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoRoomComponent } from './video-room/video-room.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: ':roomName', component: VideoRoomComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
