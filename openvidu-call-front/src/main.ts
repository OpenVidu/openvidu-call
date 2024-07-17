import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { OpenViduComponentsModule, OpenViduComponentsConfig } from 'openvidu-components-angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';

const componentsConfig: OpenViduComponentsConfig = {
	production: environment.production
};

if (environment.production) {
	enableProdMode();
}

bootstrapApplication(AppComponent, {
	providers: [
		importProvidersFrom(BrowserModule, OpenViduComponentsModule.forRoot(componentsConfig), AppRoutingModule),
		provideAnimations()
	]
}).catch((err) => console.log(err));
