import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarComponent } from './toolbar.component';
import { UtilsService } from '../../services/utils/utils.service';
import { UtilsServiceMock } from '../../services/utils/utils.service.mock';
import { ChatService } from '../../services/chat/chat.service';
import { ChatServiceMock } from '../../services/chat/chat.service.mock';
import {
	HasChatPipe,
	HasVideoPipe,
	HasAudioPipe,
	HasScreenSharingPipe,
	HasFullscreenPipe,
	HasLayoutSpeakingPipe,
	HasExitPipe
} from '../../pipes/ovSettings.pipe';
import { LocalUsersServiceMock } from '../../services/local-users/local-users.service.mock';
import { LocalUsersService } from '../../services/local-users/local-users.service';
import { TokenService } from '../../services/token/token.service';
import { TokenServiceMock } from '../../services/token/token.service.mock';

describe('ToolbarComponent', () => {
	let component: ToolbarComponent;
	let fixture: ComponentFixture<ToolbarComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				ToolbarComponent,
				HasLayoutSpeakingPipe,
				HasFullscreenPipe,
				HasScreenSharingPipe,
				HasChatPipe,
				HasVideoPipe,
				HasAudioPipe,
				HasExitPipe
			],
			providers: [
				{ provide: UtilsService, useClass: UtilsServiceMock },
				{ provide: ChatService, useClass: ChatServiceMock },
				{ provide: LocalUsersService, useClass: LocalUsersServiceMock },
				{ provide: TokenService, useClass: TokenServiceMock }

			]
		}).compileComponents();
		fixture = TestBed.createComponent(ToolbarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
