## ComnAuthModule

#### Description

The Common Auth module is a module that interacts with the Identity server, providing authentication  
to the application.

#### Dependencies

- 'oidc-client-ts' - npm
- Common Settings Service Located in the [Common Settings Module](../comn-settings/README.md)

#### Routes

The ComnAuthModule provides its own routes for the application.

- `auth-callback` - Component to process OIDC authorization and validation.
- `auth-callback-silent` - Component to process silent authorization as well as token refresh
- `logout` - Logs out the user from the Identity server and returns them to the home page.

#### Implementation

CWD Auth module needs to be imported into your NgModule declaration. Keep in mind the ComnAuthModule is dependent on the ComnSettingService.

```typescript
export const settings: ComnSettingsConfig = {
  url: `assets/config/settings.json`,
  envUrl: `assets/config/settings.env.json`
};

@NgModule({
 declarations: [ AppComponent ],
 imports: [
  BrowserModule,
  AppRoutingModule,
  ComnSettingsModule.forRoot(settings),
  ComnAuthModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
```

##### Auth state

`ComnAuthQuery` exposes the signed-in user and the user's theme as signals (`user`, `isLoggedIn`, `userTheme`) and as observables of the same values (`user$`, `isLoggedIn$`, `userTheme$`). The observables come from `toObservable`: they replay the current value to a new subscriber, and they emit changes when Angular next runs effects (normally the next change detection), not synchronously on each update. `ComnAuthService.setUserTheme(theme)` changes the theme.

The theme resets to light on every load unless the app gives a localStorage key to keep it under, in its root providers (`bootstrapApplication` or the root NgModule):

```typescript
import { provideComnAuthThemeStorage } from '@cmusei/crucible-common';

providers: [provideComnAuthThemeStorage('player-ui.theme')];
```

Use a key unique to the app: apps served from the same origin share localStorage.

##### Silent Callback

The auth-callback-silent component is implemented as a static html page, to avoid loading the entirety of the Angular app in the background iframe to refresh authentication. To use this in a consuming application, you must add the following to the list of assets to include in the build in your Angular.json file:

```
{
  "glob": "auth-callback-silent.html",
  "input": "node_modules/@cmusei/crucible-common/src/lib/comn-auth/assets/",
  "output": "/"
}
```

Example:

```
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
    "options": {
      ...
      ...
      ...
      "assets": [
        "src/assets",
        {
          "glob": "auth-callback-silent.html",
          "input": "node_modules/@cmusei/crucible-common/src/lib/comn-auth/assets/",
          "output": "/"
        }
      ],
      ...
      ...
      ...
    }
  }
}
```
