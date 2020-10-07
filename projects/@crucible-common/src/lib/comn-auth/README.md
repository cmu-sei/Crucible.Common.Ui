## ComnAuthModule

#### Description

The Common Auth module is a module that interacts with the Identity server, providing authentication  
to the application.

#### Dependencies

- 'oidc-client' - npm
- Common Settings Service Located in the [Common Settings Module](../comn-settings/README.md)

#### Routes

The ComnAuthModule provides its own routes for the application.

- `auth-callback` - Component to process OIDC authorization and validation.
- `auth-callback-silent` - Component to process silent authorization as well as token refresh
- `logout` - Logs out the user from the Identity server and returns them to the home page.

#### Implementation

CWD Auth module only needs to be imported into your NgModule declaration. Keep in mind the ComnAuthModule is dependent on the ComnSettingService.

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
