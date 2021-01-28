import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopoverFolioPage } from './popover-folio.page';

describe('PopoverFolioPage', () => {
  let component: PopoverFolioPage;
  let fixture: ComponentFixture<PopoverFolioPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopoverFolioPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopoverFolioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
