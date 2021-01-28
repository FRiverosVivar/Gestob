import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioModalPage } from './audio-modal.page';

describe('AudioModalPage', () => {
  let component: AudioModalPage;
  let fixture: ComponentFixture<AudioModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AudioModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
