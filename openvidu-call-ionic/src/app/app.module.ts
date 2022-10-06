import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

import { OpenViduAngularConfig, OpenViduAngularModule } from 'openvidu-angular';
import { environment } from 'src/environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const config: OpenViduAngularConfig = {
	production: environment.production
};

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		FormsModule,
		IonicModule.forRoot(),
		HttpClientModule,
		OpenViduAngularModule.forRoot(config),
		BrowserAnimationsModule
	],
	providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, AndroidPermissions],
	bootstrap: [AppComponent]
})
export class AppModule {}
