// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { PlaygroundModule } from 'angular-playground';

PlaygroundModule.configure({
  selector: 'app-root',
  overlay: false,
  modules: [],
});

platformBrowserDynamic().bootstrapModule(PlaygroundModule);
