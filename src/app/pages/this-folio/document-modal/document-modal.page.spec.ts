import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentModalPage } from './document-modal.page';

describe('DocumentModalPage', () => {
  let component: DocumentModalPage;
  let fixture: ComponentFixture<DocumentModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
