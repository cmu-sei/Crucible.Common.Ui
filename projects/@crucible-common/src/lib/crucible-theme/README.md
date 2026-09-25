# crucible-theme

Applies a Crucible app's colors as described in the Crucible colors design
specification (`crucible-development/design-specs/angular/colors.md`). It sets
the top-bar colors and Material's `primary` / `on-primary` roles for light and
dark mode from the app's settings, and recolors the SVG favicon to the top-bar
color.

Every color is used exactly as configured. The module never checks contrast,
lightens, darkens or derives a color. The compliant defaults ship in each app's
`settings.json`; an operator who overrides a color owns its accessibility
compliance.

## Settings

The six keys below are read from `ComnSettingsService.settings`. Ship all six
in the app's base `settings.json` with the spec's defaults (§2 and §3b), so
they stay in effect underneath any `settings.shared.json` / `settings.env.json`
overlay.

| Setting | Applies to | Fallback when missing |
|---|---|---|
| `AppTopBarHexColor` | Top-bar background, both modes | `brand.color` |
| `AppTopBarHexTextColor` | Top-bar text and icons, both modes | `brand.text` |
| `AppLightModePrimaryHexColor` | `--mat-sys-primary`, light mode | `brand.color` |
| `AppLightModePrimaryHexTextColor` | `--mat-sys-on-primary`, light mode | `brand.text` |
| `AppDarkModePrimaryHexColor` | `--mat-sys-primary`, dark mode | `AppLightModePrimaryHexColor` |
| `AppDarkModePrimaryHexTextColor` | `--mat-sys-on-primary`, dark mode | `AppLightModePrimaryHexTextColor` |

Each value is resolved independently. The top-bar keys never affect `primary`,
and the `primary` keys never affect the top bar.

## CSS custom properties

`applyTheme()` sets these on both `<html>` and `<body>`:

| Property | Value |
|---|---|
| `--app-topbar-background` | Resolved top-bar background |
| `--app-topbar-text` | Resolved top-bar text |
| `--mat-sys-primary` | Resolved `primary` for the current mode |
| `--mat-sys-on-primary` | Resolved `on-primary` for the current mode |

Style the top bar with `var(--app-topbar-background)` / `var(--app-topbar-text)`,
not `--mat-sys-primary`. In dark mode `primary` is a lighter shade meant for
content on dark surfaces, not the brand color. Components must use these tokens
rather than hard-coding a brand hex value or reading the settings directly.

## Usage

Register the providers with the app's brand pair from spec §2:

```ts
// app.module.ts providers, or bootstrapApplication providers
provideCrucibleTheme({
  brand: { color: '#006B6D', text: '#FFFFFF' },
}),
```

Apply the theme whenever the user's theme changes:

```ts
private readonly themeService = inject(CrucibleThemeService);

constructor() {
  this.authQuery.userTheme$
    .pipe(takeUntilDestroyed())
    .subscribe((theme) => this.themeService.applyTheme(theme));
}
```

`applyTheme()` toggles the `darkMode` class on `<body>`, sets the properties
above, and recolors the favicon.

### Options

| Option | Description |
|---|---|
| `brand` | Required. The app's brand color and text-on-brand color. |
| `faviconSvgPath` | SVG to recolor as the favicon. Defaults to the `href` of the page's `<link rel="icon">` when it is an SVG (`type="image/svg+xml"` or a `.svg` href). If neither is an SVG, the favicon is left unchanged. |
| `faviconFillClass` | CSS class in the SVG whose rule is replaced with the fill color. Defaults to `cls-1`. |

The favicon SVG is fetched once, bypassing HTTP interceptors, and each recolor
writes a `data:` URI built from the original artwork.

### Lower-level API

`resolveThemeColors(settings, isDark, brand)` and `applyThemeColors(colors, document)`
are exported for apps that need to drive the pipeline themselves. They have no
Angular dependencies.
