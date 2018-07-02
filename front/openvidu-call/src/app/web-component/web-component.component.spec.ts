import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebComponentComponent } from './web-component.component';

describe('WebComponentComponent', () => {
  let component: WebComponentComponent;
  let fixture: ComponentFixture<WebComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
