import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThisFolioPage } from './this-folio.page';

describe('ThisFolioPage', () => {
  let component: ThisFolioPage;
  let fixture: ComponentFixture<ThisFolioPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThisFolioPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThisFolioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
