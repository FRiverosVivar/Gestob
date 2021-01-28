import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsBookPage } from './tabs-book.page';

describe('TabsBookPage', () => {
  let component: TabsBookPage;
  let fixture: ComponentFixture<TabsBookPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabsBookPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsBookPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
