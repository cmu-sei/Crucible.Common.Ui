## Crucible Common Modules

#### Description

Crucible Common modules are a set of angular modules that are common between Crucible apps.

#### Modules

- [Settings Module](projects/@crucible-common/src/lib/comn-settings/README.md)
- [Auth Module](projects/@crucible-common/src/lib/comn-auth/README.md)

### **Running the sample application.**

The Crucible Common library is packaged with a simple sample application for limited testing. The application is linked to the library through the library's `public-api.ts` file to allow debugging of the library.

To run the application start the `json-server`

`npm run json-server`

Run the application as normal.

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

Crucible apps use a shared dynamic theming system provided by this library. A single **primary hex color** drives the entire Material 3 color scheme at runtime -- no SCSS rebuild is needed to change the theme.

### How it works

1. **`ComnDynamicThemeService`** generates a full Material 3 palette (primary, secondary, tertiary, error, background, outline, etc.) from one hex color using `@material/material-color-utilities` (`SchemeTonalSpot`).
2. It writes 44+ CSS custom properties (e.g. `--mat-sys-primary`, `--mat-sys-background`) as inline styles on `:root` (light) and via a `<style>` element for `body.darkMode` (dark).
3. All surface tokens (`--mat-sys-surface`, `--mat-sys-surface-container-*`) are aliased to `--mat-sys-background` so Crucible apps display a flat background instead of Material 3's layered surface system.
4. A shared `<style id="crucible-component-overrides">` element is injected once with global rules for mat-menu panels, mat-option, datepicker, form-field transparency, and icon-button colors.

### Where to set the theme color

The primary color is resolved in this order (first match wins):

| Priority | Location | Example |
|----------|----------|---------|
| 1 | **`settings.json`** | `"AppPrimaryThemeColor": "#008740"` |
| 2 | **`provideCrucibleTheme()`** `defaultThemeColor` | `defaultThemeColor: '#008740'` |
| 3 | Library default | `#4c7aa2` |

- **`src/assets/config/settings.json`** -- The runtime configuration file deployed with the app. This is the primary place to change the theme color for a deployment. Set the `AppPrimaryThemeColor` field to any hex color.
- **`app.module.ts`** -- The `defaultThemeColor` passed to `provideCrucibleTheme()` acts as a compile-time fallback when `settings.json` does not contain `AppPrimaryThemeColor`.
- **`src/styles/_theme-colors.scss`** -- Contains a pre-generated SCSS palette used as a baseline when the Angular Material theme is compiled. This palette should match the default primary color so the initial CSS paint is consistent before the runtime service takes over.

### Integrating in an app

```typescript
// app.module.ts
...provideCrucibleTheme({
  defaultThemeColor: '#008740',
  faviconSvgPath: 'assets/svg-icons/crucible-icon-app.svg',
}),
```

This registers:
- `ComnDynamicThemeService` -- generates and injects CSS variables
- `ComnFaviconService` -- recolors the SVG favicon to match the theme
- An `APP_INITIALIZER` that applies the theme before the app renders

### Regenerating the SCSS palette

If you change the default primary color, regenerate the SCSS palette so the compile-time baseline matches:

```bash
npx ng generate @angular/material:theme-color --primaryColor=#008740
```

Copy the generated palette into `src/styles/_theme-colors.scss`.

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

## Reporting bugs and requesting features

Think you found a bug? Please report all Crucible bugs - including bugs for the individual Crucible apps - in the [cmu-sei/crucible issue tracker](https://github.com/cmu-sei/crucible/issues).

Include as much detail as possible including steps to reproduce, specific app involved, and any error messages you may have received.

Have a good idea for a new feature? Submit all new feature requests through the [cmu-sei/crucible issue tracker](https://github.com/cmu-sei/crucible/issues).

Include the reasons why you're requesting the new feature and how it might benefit other Crucible users.
