import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCardModule,
  MatMenuModule,
  MatToolbarModule,
  MatIconModule,
  MatAutocompleteModule,
  MatInputModule,
  MatFormFieldModule
} from '@angular/material';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { VideoRoomComponent } from './video-room/video-room.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OpenViduService } from './shared/services/open-vidu.service';
import { HttpClientModule } from '@angular/common/http';
import { StreamComponent } from './stream/stream.component';

@NgModule({
  declarations: [AppComponent, VideoRoomComponent, DashboardComponent, StreamComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [ OpenViduService ],
  bootstrap: [AppComponent],
})
export class AppModule {}
