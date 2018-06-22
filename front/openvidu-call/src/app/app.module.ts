import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCardModule,
  MatToolbarModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatDialogModule,
  MatTooltipModule,
} from '@angular/material';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { VideoRoomComponent } from './video-room/video-room.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OpenViduService } from './shared/services/open-vidu.service';
import { StreamComponent } from './shared/components/stream/stream.component';
import { HttpClientModule } from '@angular/common/http';
import { DialogNicknameComponent } from './shared/components/dialog-nickname/dialog-nickname.component';
import { ChatComponent } from './shared/components/chat/chat.component';
import { DialogExtensionComponent } from './shared/components/dialog-extension/dialog-extension.component';
import { OpenViduVideoComponent } from './shared/components/stream/ov-video.component';
import { createCustomElement } from '@angular/elements';
import { DialogErrorComponent } from './shared/components/dialog-error/dialog-error.component';

@NgModule({
  declarations: [
    AppComponent,
    VideoRoomComponent,
    DashboardComponent,
    StreamComponent,
    DialogNicknameComponent,
    ChatComponent,
    DialogExtensionComponent,
    OpenViduVideoComponent,
    DialogErrorComponent
  ],
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
    MatDialogModule,
    MatTooltipModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  entryComponents: [
    DialogErrorComponent,
    DialogNicknameComponent,
    DialogExtensionComponent,
  ],
  providers: [OpenViduService],
  bootstrap: [AppComponent],
})
export class AppModule {

  constructor(private injector: Injector) {
    const element = createCustomElement(VideoRoomComponent, { injector: this.injector });
    customElements.define('openvidu-session', element);
  }

  ngDoBootstrap() {}
}
