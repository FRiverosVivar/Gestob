import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewfolioPage } from './newfolio.page';

describe('NewfolioPage', () => {
  let component: NewfolioPage;
  let fixture: ComponentFixture<NewfolioPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewfolioPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewfolioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
