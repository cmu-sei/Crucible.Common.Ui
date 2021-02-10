// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ComnAuthCallbackComponent } from './comn-auth-callback.component';

describe('ComnAuthCallbackComponent', () => {
  let component: ComnAuthCallbackComponent;
  let fixture: ComponentFixture<ComnAuthCallbackComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ComnAuthCallbackComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComnAuthCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
