// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComnAuthCallbackSilentComponent } from './comn-auth-callback-silent.component';

describe('CwdAuthCallbackSilentComponent', () => {
  let component: ComnAuthCallbackSilentComponent;
  let fixture: ComponentFixture<ComnAuthCallbackSilentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComnAuthCallbackSilentComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComnAuthCallbackSilentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
