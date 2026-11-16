// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

// Lint fixture for index.test.mjs: an operator after takeUntilDestroyed() keeps the inner subscription alive.
import { interval, MonoTypeOperatorFunction, Observable, of, switchMap, takeUntil } from 'rxjs';

declare function takeUntilDestroyed<T>(): MonoTypeOperatorFunction<T>;
declare const destroyed: Observable<void>;

export const unsafe = of(1).pipe(
  takeUntilDestroyed(),
  switchMap(() => interval(1000)),
);
export const safe = of(1).pipe(
  switchMap(() => interval(1000)),
  takeUntilDestroyed(),
);
export const unsafeTakeUntil = of(1).pipe(
  takeUntil(destroyed),
  switchMap(() => interval(1000)),
);
