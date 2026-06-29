// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CrucibleConfirmDialogComponent } from '../components/crucible-confirm-dialog/crucible-confirm-dialog.component';
import { CrucibleDialogService } from './crucible-dialog.service';

describe('CrucibleDialogService', () => {
  let service: CrucibleDialogService;
  let matDialog: MatDialog;
  let openSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [CrucibleDialogService],
    });
    service = TestBed.inject(CrucibleDialogService);
    matDialog = TestBed.inject(MatDialog);
    openSpy = spyOn(matDialog, 'open').and.callThrough();
  });

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  it('opens the confirm dialog with per-field default labels', () => {
    service.confirm({ title: 'T', message: 'M' });
    expect(openSpy).toHaveBeenCalledTimes(1);
    const [component, config] = openSpy.calls.mostRecent().args;
    expect(component).toBe(CrucibleConfirmDialogComponent);
    expect(config.data.confirmText).toBe('Yes');
    expect(config.data.cancelText).toBe('No');
    expect(config.maxWidth).toBe('90vw');
    expect(config.disableClose).toBeFalse();
  });

  it('forwards width and maxWidth and overrides confirm/cancel text', () => {
    service.confirm({
      title: 'Delete?',
      message: 'Sure?',
      confirmText: 'Delete',
      cancelText: 'No',
      width: '420px',
      maxWidth: '80vw',
    });
    const [, config] = openSpy.calls.mostRecent().args;
    expect(config.width).toBe('420px');
    expect(config.maxWidth).toBe('80vw');
    expect(config.data.confirmText).toBe('Delete');
  });

  it('does not let an explicitly-undefined caller field clobber a default', () => {
    service.confirm({
      title: 'T',
      message: 'M',
      confirmText: undefined,
      cancelText: undefined,
      maxWidth: undefined,
    });
    const [, config] = openSpy.calls.mostRecent().args;
    expect(config.data.confirmText).toBe('Yes');
    expect(config.data.cancelText).toBe('No');
    expect(config.maxWidth).toBe('90vw');
  });

  it('returns a MatDialogRef whose afterClosed emits a boolean', (done) => {
    const ref = service.confirm({ title: 'T', message: 'M' });
    expect(ref).toBeInstanceOf(MatDialogRef);
    ref.afterClosed().subscribe((result) => {
      expect(result).toBeTrue();
      done();
    });
    ref.close(true);
  });
});
