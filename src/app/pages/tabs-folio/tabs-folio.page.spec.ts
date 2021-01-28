import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsFolioPage } from './tabs-folio.page';

describe('TabsFolioPage', () => {
  let component: TabsFolioPage;
  let fixture: ComponentFixture<TabsFolioPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabsFolioPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsFolioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
