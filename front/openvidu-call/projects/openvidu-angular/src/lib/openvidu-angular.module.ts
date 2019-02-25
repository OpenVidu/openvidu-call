import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatOptionModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';
import { NgxLinkifyjsModule } from 'ngx-linkifyjs';

import { AppRoutingModule } from './app-routing.module';
import { OpenviduSessionComponent } from './openvidu-angular.component';
import { ChatComponent } from './shared/components/chat/chat.component';
import { DialogChooseRoomComponent } from './shared/components/dialog-choose-room/dialog-choose-room.component';
import { DialogErrorComponent } from './shared/components/dialog-error/dialog-error.component';
import { DialogExtensionComponent } from './shared/components/dialog-extension/dialog-extension.component';
import { OpenViduVideoComponent } from './shared/components/stream/ov-video.component';
import { StreamComponent } from './shared/components/stream/stream.component';
import { ToolbarComponent } from './shared/components/toolbar/toolbar.component';
import { LinkifyPipe } from './shared/pipes/linkfy';
import { ApiService } from './shared/services/api.service';
import { OpenViduService } from './shared/services/open-vidu.service';
import { VideoRoomComponent } from './video-room/video-room.component';

// Components
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatTooltipModule,
    MatBadgeModule,
    MatGridListModule,
    MatCheckboxModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    MatSidenavModule,
    AppRoutingModule,
    MatChipsModule,
    NgxLinkifyjsModule.forRoot()
  ],
  declarations: [
    OpenviduSessionComponent,
    VideoRoomComponent,
    StreamComponent,
    ChatComponent,
    DialogExtensionComponent,
    OpenViduVideoComponent,
    DialogErrorComponent,
    DialogChooseRoomComponent,
    ToolbarComponent,
    LinkifyPipe
  ],
  entryComponents: [
    DialogErrorComponent,
  ],
  providers: [OpenViduService, ApiService],
  exports: [OpenviduSessionComponent],
})
export class OpenviduSessionModule { }
