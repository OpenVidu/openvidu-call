import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomConfigComponent } from './room-config.component';
import { LoggerService } from '../../services/logger/logger.service';
import { UtilsService } from '../../services/utils/utils.service';
import { OpenViduSessionService } from '../../services/openvidu-session/openvidu-session.service';
import { DevicesService } from '../../services/devices/devices.service';
import { DevicesServiceMock } from '../../services/devices/devices.service.mock';
import { UtilsServiceMock } from '../../services/utils/utils.service.mock';
import { OpenViduSessionServiceMock } from '../../services/openvidu-session/openvidu-session.service.mock';
import { LoggerServiceMock } from '../../services/logger/logger.service.mock';
import { RouterTestingModule } from '@angular/router/testing';
import { IsAutoPublishPipe } from '../../pipes/ovSettings.pipe';

describe('RoomConfigComponent', () => {
	let component: RoomConfigComponent;
	let fixture: ComponentFixture<RoomConfigComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [RoomConfigComponent, IsAutoPublishPipe],
			providers: [
				{provide: LoggerService, useClass: LoggerServiceMock},
				{provide: UtilsService, useClass: UtilsServiceMock},
				{provide: OpenViduSessionService, useClass: OpenViduSessionServiceMock},
				{provide: DevicesService, useClass: DevicesServiceMock},
			],
			imports: [RouterTestingModule.withRoutes([])],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(RoomConfigComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
