## Unreleased

- **BREAKING CHANGE** - Removed the `comn-theme` module (`provideCrucibleTheme` with
  `defaultThemeColor`, `ComnDynamicThemeService`, `ComnFaviconService`,
  `crucibleThemeInitializer`). It generated a Material 3 palette at runtime from
  `AppPrimaryThemeColor`, which the Crucible colors design specification forbids,
  and no app used it. `@material/material-color-utilities` is no longer a peer
  dependency.
- Added the `crucible-theme` module, implementing the Crucible colors design
  specification: `provideCrucibleTheme({ brand })` and
  `CrucibleThemeService.applyTheme(theme)` resolve the six top-bar / light-mode /
  dark-mode color settings and apply them as `--crucible-topbar-background`,
  `--crucible-topbar-text`, `--mat-sys-primary` and `--mat-sys-on-primary`, and
  recolor the SVG favicon. See crucible-theme/README.md.
- Added the Open Sans font through a new dependency on `@fontsource/open-sans`
  (SIL Open Font License 1.1). `@use '@cmusei/crucible-common/fonts';` in an
  app's global stylesheet declares the `'Open Sans'` family (regular, italic,
  bold); the Angular application builder emits the font files into the app's
  build output, so apps no longer need their own copies. This is the current
  Open Sans release, not the 1.10 files apps have carried until now.
- `comn-header-bar` now sets `font-family: 'Open Sans', sans-serif` itself
  instead of inheriting the app's font.

## 0.6.1

- Added the crucible-dialog module: shared, app-agnostic modal building blocks
  (`CrucibleDialogService.confirm(...)` for confirm dialogs and the
  `<crucible-dialog>` wrapper for reactive-form, template-driven, and
  content-only modals) with consistent structure, theming, and dismissal
  behavior. Adds `@angular/forms`, `@angular/material`, and `@angular/cdk` as
  peer dependencies. See crucible-dialog/README.md.

## 0.6.0

- Added the comn-header-bar for displaying classification levels and maintenance messages.

## 0.4.3

- Updated from Angular 14 to 21. This update requires that consuming apps use Angular 21.0.0 or higher.

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
