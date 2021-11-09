import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenviduComponentsComponent } from './openvidu-components.component';
import { ToolbarComponent } from './toolbar/toolbar.component';



@NgModule({
  declarations: [
    OpenviduComponentsComponent,
    ToolbarComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    OpenviduComponentsComponent,
    ToolbarComponent,
    CommonModule
  ],
})
export class OpenviduComponentsModule { }
