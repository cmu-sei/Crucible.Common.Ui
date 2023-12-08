## 0.4.0

- **BREAKING CHANGE** - Removed auth-callback-silent endpoint and replaced with a static html page. See comn-auth/README.md for how to configure your application to use this asset.
- Migrated away from deprecated oidc-client to oidc-client-ts.
- Added support for oidc-client-ts debug logging by setting DebugLogging to true in settings.json of the consuming application.
- Reduced browser history clutter when redirecting for authentication and fixed error when using browser back button after successful authentication
- Improved settings merge to use default OIDCSettings properties when not overridden in settings.env.json.

## 0.0.3

- Added Changelog
- Bugfix - Removed AuthGuard from Auth-Callback component.
- Enabled library to be debugged externally.
- Added instructions to debug the library from external applications.
- Removed event from oidc userManger that was causing logout on initial load.

## 0.0.2

Bug Fixes

## 0.0.1

Initial release
