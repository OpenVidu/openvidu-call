import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCardModule,
  MatToolbarModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatSnackBarModule,
  MatButtonToggleModule,
  MatDialogModule,
} from '@angular/material';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { VideoRoomComponent } from './video-room/video-room.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OpenViduService } from './shared/services/open-vidu.service';
import { StreamComponent } from './shared/components/stream/stream.component';
import { HttpClientModule } from '@angular/common/http';
import { DialogNicknameComponent } from './shared/components/dialog-nickname/dialog-nickname.component';

@NgModule({
  declarations: [AppComponent, VideoRoomComponent, DashboardComponent, StreamComponent, DialogNicknameComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    MatDialogModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  entryComponents: [AppComponent, VideoRoomComponent, DashboardComponent, StreamComponent, DialogNicknameComponent],
  providers: [OpenViduService],
  bootstrap: [AppComponent],
})
export class AppModule {}
