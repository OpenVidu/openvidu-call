import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { VideoRoomComponent } from './video-room.component';
import { LoggerService } from '../shared/services/logger/logger.service';
import { LoggerServiceMock } from '../shared/services/logger/logger.service.mock';
import { NetworkServiceMock } from '../shared/services/network/network.service.mock';
import { NetworkService } from '../shared/services/network/network.service';
import { UtilsService } from '../shared/services/utils/utils.service';
import { RemoteUsersService } from '../shared/services/remote-users/remote-users.service';
import { DevicesService } from '../shared/services/devices/devices.service';
import { OpenViduSessionService } from '../shared/services/openvidu-session/openvidu-session.service';
import { ChatService } from '../shared/services/chat/chat.service';
import { OpenViduSessionServiceMock } from '../shared/services/openvidu-session/openvidu-session.service.mock';
import { ChatServiceMock } from '../shared/services/chat/chat.service.mock';
import { DevicesServiceMock } from '../shared/services/devices/devices.service.mock';
import { UtilsServiceMock } from '../shared/services/utils/utils.service.mock';
import { RemoteUsersServiceMock } from '../shared/services/remote-users/remote-users.service.mock';

describe('VideoRoomComponent unit test', () => {
	let component: VideoRoomComponent;
	let fixture: ComponentFixture<VideoRoomComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VideoRoomComponent],
			providers: [
				{ provide: LoggerService, useClass: LoggerServiceMock },
				{ provide: NetworkService, useClass: NetworkServiceMock },
				{ provide: UtilsService, useClass: UtilsServiceMock },
				{ provide: RemoteUsersService, useClass: RemoteUsersServiceMock },
				{ provide: OpenViduSessionService, useClass: OpenViduSessionServiceMock },
				{ provide: DevicesService, useClass: DevicesServiceMock },
				{ provide: ChatService, useClass: ChatServiceMock }
			],
			imports: [RouterTestingModule.withRoutes([])]
		}).compileComponents();
		fixture = TestBed.createComponent(VideoRoomComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
