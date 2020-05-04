import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamComponent } from './stream.component';
import { UtilsService } from '../../services/utils/utils.service';
import { UtilsServiceMock } from '../../services/utils/utils.service.mock';
import { UserModel } from '../../models/user-model';

describe('StreamComponent', () => {
	let component: StreamComponent;
	let fixture: ComponentFixture<StreamComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [StreamComponent],
			providers: [{ provide: UtilsService, useClass: UtilsServiceMock }]
		}).compileComponents();
		fixture = TestBed.createComponent(StreamComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
