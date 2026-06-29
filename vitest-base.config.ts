// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

// Base Vitest configuration auto-discovered by the @angular/build:unit-test
// builder (it searches the project root and workspace root for a
// `vitest-base.config.*` file and merges it into the generated config).
//
// `@material/material-color-utilities` ships as an ESM package whose internal
// files use extensionless relative imports (e.g. `./dynamic_color`). Vite's
// default ESM resolver rejects those, so the dependency must be inlined and
// transformed by Vite rather than imported as an external module. It is pulled
// in transitively by the library's comn-theme service.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    server: {
      deps: {
        inline: [/@material\/material-color-utilities/],
      },
    },
  },
});
