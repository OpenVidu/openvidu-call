import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessPermissionsComponent } from './access-permissions.component';

describe('AccessPermissionsComponent', () => {
  let component: AccessPermissionsComponent;
  let fixture: ComponentFixture<AccessPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessPermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
