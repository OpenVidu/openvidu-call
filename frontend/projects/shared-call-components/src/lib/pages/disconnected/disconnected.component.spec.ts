import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisconnectedComponent } from './disconnected.component';

describe('ParticipantDisconnectedComponent', () => {
	let component: DisconnectedComponent;
	let fixture: ComponentFixture<DisconnectedComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [DisconnectedComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(DisconnectedComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
