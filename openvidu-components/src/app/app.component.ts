import { Component } from '@angular/core';
import { ToolbarComponent } from 'projects/openvidu-components-library/src/lib/toolbar/toolbar.component';
import {OpenviduComponentsService} from 'projects/openvidu-components-library/src/lib/openvidu-components.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'openvidu-components';
  toolbarColor = ''

  constructor(private componentService: OpenviduComponentsService, private component: ToolbarComponent){}

  clickButton() {
    console.log('button clicked');
    this.componentService.changeFontColor();
    this.toolbarColor = this.component.getRandomColor();
  }
}
