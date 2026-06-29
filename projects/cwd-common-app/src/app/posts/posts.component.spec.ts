// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PostsComponent } from './posts.component';
import { ComnSettingsService } from 'projects/@crucible-common/src/public-api';

// PostsComponent injects ComnSettingsService (only reads settings.ApiUrl); a
// stub avoids constructing the real service and firing a real request.
const settingsStub: Partial<ComnSettingsService> = {
  settings: { ApiUrl: 'https://example.test/api' },
};

describe('PostsComponent', () => {
  let component: PostsComponent;
  let fixture: ComponentFixture<PostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // PostsComponent is standalone (imports CommonModule itself).
      imports: [PostsComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ComnSettingsService, useValue: settingsStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
