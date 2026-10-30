## Crucible Common Modules

#### Description

Crucible Common modules are a set of angular modules that are common between Crucible apps.

#### Modules

- [Settings Module](projects/@crucible-common/src/lib/comn-settings/README.md) — loads runtime app settings from a JSON file and exposes them via a service.
- [Auth Module](projects/@crucible-common/src/lib/comn-auth/README.md) — OpenID Connect authentication, with optional access-token-expiration and inactivity monitoring (see [below](#access-token-expiration-and-inactivity-monitoring)).
- [Theme Module (`crucible-theme`)](projects/@crucible-common/src/lib/crucible-theme/README.md) — applies the top-bar and Material `primary` colors for light and dark mode per the Crucible colors design spec (see [Color Theming](#color-theming) below).
- **Header Bar (`comn-header-bar`)** — displays classification levels and maintenance messages (see [Header Bar](#header-bar) below).
- **Fonts (`@cmusei/crucible-common/fonts`)** — Open Sans and the Sass partial that declares it (see [Fonts](#fonts) below).
- [Dialog Module (`crucible-dialog`)](projects/@crucible-common/src/lib/crucible-dialog/README.md) — shared, app-agnostic modal building blocks (confirm dialogs, reactive-form modals, content/custom-footer dialogs) with consistent structure and dismissal behavior.
- [Landing Background (`crucible-landing-background`)](projects/@crucible-common/src/lib/crucible-landing-background/README.md) — the `[crucibleLandingBackground]` directive, which shows the `AppLandingBackgroundImage` setting behind an app's landing page, tinted in dark mode.

### **Running the sample application.**

The Crucible Common library is packaged with a simple sample application for limited testing. The application is linked to the library through the library's `public-api.ts` file to allow debugging of the library.

To run the application start the `json-server`

`npm run json-server`

Run the application as normal. The sample app includes a `/dialogs` route
(`dialog-demo`) that exercises the `crucible-dialog` module — confirm dialogs,
reactive-form modals, and content/custom-footer dialogs.

## Unit testing

The library and the sample app are unit-tested with [Karma](https://karma-runner.github.io/)
and [Jasmine](https://jasmine.github.io/), wired through the Angular CLI
`@angular-devkit/build-angular:karma` builder.

### Running the tests

```bash
# Library specs (projects/@crucible-common)
ng test crucible-common

# Sample/demo app specs (projects/cwd-common-app)
ng test cwd-common-app
```

`npm test` maps to `ng test`. There is no default project, so pass the project
name (`crucible-common` or `cwd-common-app`) to choose which suite runs.

### Layout and configuration

- **Spec files** live next to the code they cover as `*.spec.ts` (e.g.
  `crucible-dialog/services/crucible-dialog.service.spec.ts`). Both the
  `crucible-dialog` components and its service ship specs.
- **Karma config** is per-project: `projects/@crucible-common/karma.conf.js`
  for the library and `projects/cwd-common-app/karma.conf.cjs` for the app
  (the app uses the `.cjs` extension because its `package.json` is ESM).
- **Spec TypeScript config** is per-project: `tsconfig.spec.json` in each
  project root, referenced by the `test` target in `angular.json`.
- **Test target wiring** is the `test` architect target for each project in
  `angular.json`.

### Headless Chrome

Both Karma configs define a `ChromeHeadlessNoSandbox` launcher (the default
browser) that runs headless Chrome with `--no-sandbox --disable-gpu
--disable-dev-shm-usage`, so the suites run unattended in CI and containers.
Set the `CHROME_BIN` environment variable if Karma can't locate a Chrome
binary, e.g.:

```bash
CHROME_BIN=$(which google-chrome) ng test crucible-common
```

Coverage reports (html + text summary) are written under `coverage/` per
project.

### Dev dependencies

The Karma/Jasmine toolchain (`karma`, `karma-chrome-launcher`,
`karma-coverage`, `karma-jasmine`, `karma-jasmine-html-reporter`,
`jasmine-core`, `@types/jasmine`) is declared in the root `package.json`
`devDependencies` and is installed by `npm install`.

## **External Testing.**

In some cases it may be necessary to test the library in an external application with an installed npm package. There can be slight differences in the compiled npm package and the library code.

We use `npm link` to map our local instance to npm. An npm script has been created to make this easier `npm run build:link` to compile and link the library then in your external application run `npm link @cmusei/crucible-common` to link the library. After you have linked the library, if you update any library code it will automatically be avaiable in the external application

## Debugging from an external application

Debugging is possible from an external application this is sometimes neccessary to debug complex issues in a specific application. The @cmusei/crucible-common library is set up to be debugged from external applications. The specific setting in a library that needs to be updated to enable debugging of the library is in

In your external application some settings need to be changed

angular.json

```diff
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "s3.vm.ngconsole": {
      "root": "",
      "sourceRoot": "src",
      "projectType": "application",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
+           "preserveSymlinks": true,
            "outputPath": "dist",
            "index": "src/index.html",
            "main": "src/main.ts",
            "tsConfig": "src/tsconfig.app.json",
            "polyfills": ["zone.js"],
            "assets": ["src/assets", "src/favicon.ico"],
            "styles": ["src/styles/styles.scss"],
            "scripts": [
              "node_modules/jquery/dist/jquery.js",
              "node_modules/jquery-ui-dist/jquery-ui.js",
              "src/assets/vmware-wmks/js/wmks.min.js"
            ]
          },
          "configurations": {
            "production": {
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "extractCss": true,
              "namedChunks": false,
              "aot": true,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true,
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ]
            }
          }
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "browserTarget": "s3.vm.ngconsole:build",
            "port": 4305,
+           "sourceMap": {
+             "vendor": true
+           }
          },
          "configurations": {
            "production": {
              "browserTarget": "s3.vm.ngconsole:build:production"
            }
          }
        },
        "extract-i18n": {
          "builder": "@angular-devkit/build-angular:extract-i18n",
          "options": {
            "browserTarget": "s3.vm.ngconsole:build"
          }
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "main": "src/test.ts",
            "karmaConfig": "./karma.conf.js",
            "polyfills": ["zone.js", "zone.js/testing"],
            "tsConfig": "src/tsconfig.spec.json",
            "scripts": [
              "node_modules/jquery/dist/jquery.js",
              "node_modules/jquery-ui-dist/jquery-ui.js",
              "src/assets/vmware-wmks/js/wmks.min.js"
            ],
            "styles": ["src/styles.css"],
            "assets": ["src/assets", "src/favicon.ico"]
          }
        },
        "lint": {
          "builder": "@angular-devkit/build-angular:tslint",
          "options": {
            "tsConfig": ["src/tsconfig.app.json", "src/tsconfig.spec.json"],
            "exclude": ["**/node_modules/**"]
          }
        }
      }
    },
```

Finally for vscode to recognize the changes you need to override the sourcemaps for the library

.vscode/launch.json

```diff
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ng serv",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: start",
      "url": "http://localhost:4305/vm/4204c65c-6829-4f5c-f6f5-e98e5961fbf5/console",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:/*": "${webRoot}/_",
        "/./_": "${webRoot}/*",
        "/src/*": "${webRoot}/_",
        "/_": "_",
        "/./~/_": "\${webRoot}/node_modules/\*",
+       "webpack:///ng://@cmusei/crucible-common/lib/*": "${workspaceFolder}/../common.ui/projects/@crucible-common/src/lib/*"
      }
    }
  ]
}

```

You can then place breakpoints in the library typescript files and they will be hit with the debugger. Debugging will work with two instances of vscode open however it may be more practical to create a workspace in vscode and add the library and external application to the workspace. [Multi-root Workspaces](https://code.visualstudio.com/docs/editor/multi-root-workspaces)

## Color Theming

The `crucible-theme` module applies each app's top-bar and Material `primary` colors for light and dark mode from six `settings.json` keys, following the Crucible colors design specification (`crucible-development/design-specs/angular/colors.md`). Colors are used exactly as configured; nothing is derived at runtime. See [crucible-theme/README.md](projects/%40crucible-common/src/lib/crucible-theme/README.md) for the settings contract and integration steps.

## Header Bar

`comn-header-bar` is the classification banner. There are two ways to use it.

**With the settings service.** Import `ComnHeaderBarModule` from `@cmusei/crucible-common` and add
`<comn-header-bar />`. The banner reads `HeaderBarSettings` from `ComnSettingsService`.

**On its own.** Import `ComnHeaderBarComponent` (standalone) from `@cmusei/crucible-common/header-bar`
and pass the settings in, from whatever settings service the app has:

```html
<comn-header-bar [settings]="settings.HeaderBarSettings" />
```

This entry point needs only `@angular/core` and `@angular/common`, so an app that uses nothing else
from the library doesn't need Material, CDK, Akita or `oidc-client-ts`. The banner is hidden when the
settings are missing, `enabled` is false, both texts are empty, or the page is shown in a frame (the
framing page shows its own banner).

## Dependencies

`@angular/core`, `@angular/common`, `@angular/forms` and `rxjs` are peer dependencies. The auth, dialog
and theme modules also need `@angular/material`, `@angular/cdk`, `@datorama/akita` and
`oidc-client-ts`, which apps that use those modules install themselves. They aren't listed as peers,
because npm checks the newest version of every listed peer, even an optional one it doesn't install,
and fails the install for an app on an older Angular, such as one that only uses the header bar.

## Fonts

The package depends on [`@fontsource/open-sans`](https://www.npmjs.com/package/@fontsource/open-sans)
and ships a Sass partial that declares the `'Open Sans'` family (regular,
italic and bold) from it. Load it once from the app's global stylesheet (e.g.
`src/styles/styles.scss`):

```scss
@use '@cmusei/crucible-common/fonts';
```

The partial is exposed through the `sass` condition of the package `exports`,
so no `includePaths`/`stylePreprocessorOptions` entry is needed. The Angular
application builder (`@angular/build`) rebases the fontsource `url()`s and
copies the font files into the build output (`media/`), so the app needs no
`assets` entry and no font files of its own. Each weight is split into
unicode-range subsets, and browsers only download the subsets a page uses. Apps then reference
the family as usual, e.g. `typography: '"Open Sans", sans-serif'` in the
Material theme.

`comn-header-bar` sets `font-family: 'Open Sans', sans-serif` itself, so the
classification banner uses Open Sans in any app that loads the partial,
whatever font the surrounding page uses.

Open Sans is licensed under the SIL Open Font License 1.1; the license ships in
the `@fontsource/open-sans` package. This is the current Open Sans release, not
the Open Sans 1.10 files Crucible apps have carried until now; the classification
banner still renders 46px tall with it.

## Access token expiration and inactivity monitoring

In order to satisfy DFARS compliance, our apps must cease displaying information when user access times out. Therefore, an optional monitor for access token expiration was incorporated to the ComnAuthService. The access token expiration monitor will redirect to the signout redirect URL when the access token expires, if it is enabled. To enable the access token expiration monitor, add the useAccessTokenExpirationRedirect setting as follows:

```
  "useAccessTokenExpirationRedirect": true,
```

In addition, an optional inactivity moniter has been incorporated to the ComnAuthService, as well. The inactivity monitor can be activated by adding an inactivityTimeMinutes setting to the application's settings.json file. By default, the inactivity monitor will also redirect to the signout redirect URL. However, the inactivity timer can redirect to any other url by adding an inactivityRedirectUrl setting to the application's settings.json file.

```
  "inactivityTimeMinutes": 60,
  "inactivityRedirectUrl": "http://my-special-site.com",
```

## Release process

Releases are published to npm as [`@cmusei/crucible-common`](https://www.npmjs.com/package/@cmusei/crucible-common)
by the **Build NPM Package as Release** workflow
(`.github/workflows/main.yml`). CI owns the version number.

### Do not bump the version in a PR

**Pull requests should not change the `version` field in `package.json` or
`projects/@crucible-common/package.json`.** Leave both at whatever value they
already hold and let the release workflow set them.

The version in the repository therefore reflects the *last published release*,
not the changes queued on `main`. A PR whose diff touches only source, specs,
and docs is what a normal contribution looks like — a version bump in the diff
is a review comment.

### Publishing a release

1. Merge everything intended for the release into `main`.
2. Go to **Actions → Build NPM Package as Release → Run workflow**, targeting
   the branch you are releasing from (normally `main`).
3. Fill in the inputs:
   - **version** (required) — the full semver version to publish, e.g. `0.8.0`
     or `0.8.0-rc.1`. No leading `v`.
   - **tag** (optional) — the npm [dist-tag](https://docs.npmjs.com/cli/commands/npm-dist-tag).
     Leave it blank for a normal release, which publishes as `latest`. **Set it
     for any prerelease** (e.g. `next`, `rc`) so the prerelease does not become
     the default version that `npm install` resolves.
4. Run the workflow.

The workflow then:

- writes the supplied version into both `package.json` files
  (`npm version --allow-same-version --no-git-tag-version`);
- commits `Update version number to <version>` and pushes it to the branch the
  workflow ran against — this step is idempotent and no-ops when the version is
  already correct;
- runs `npm install` and `npm run pack` to build the library; and
- publishes `dist/@crucible-common/cmusei-crucible-common-<version>.tgz` to npm
  with `--access public`, adding `--tag <tag>` when a dist-tag was supplied.

## Reporting bugs and requesting features

Think you found a bug? Please report all Crucible bugs - including bugs for the individual Crucible apps - in the [cmu-sei/crucible issue tracker](https://github.com/cmu-sei/crucible/issues).

Include as much detail as possible including steps to reproduce, specific app involved, and any error messages you may have received.

Have a good idea for a new feature? Submit all new feature requests through the [cmu-sei/crucible issue tracker](https://github.com/cmu-sei/crucible/issues).

Include the reasons why you're requesting the new feature and how it might benefit other Crucible users.
