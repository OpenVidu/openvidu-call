import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogExtensionComponent } from './dialog-extension.component';

describe('DialogExtensionComponent', () => {
  let component: DialogExtensionComponent;
  let fixture: ComponentFixture<DialogExtensionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogExtensionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
