# crucible-landing-background

Shows an operator-supplied image behind a Crucible app's landing page. The
image is configured per site, so it never ships in an app's repository.

## Setting

| Setting | Description |
|---|---|
| `AppLandingBackgroundImage` | URL of the image. Empty, blank or missing shows no image. |

The directive reads the setting from the first of these that is there:

1. its `crucibleLandingBackgroundSettings` input;
2. the `CRUCIBLE_LANDING_BACKGROUND_SETTINGS` injection token;
3. `ComnSettingsService.settings`, when the app configured it with
   `COMN_SETTINGS_CONFIG` (`ComnSettingsModule.forRoot()`), as the
   Player-family apps do. The key can then be set in `settings.json`,
   `settings.shared.json` (to share it across apps, like `HeaderBarSettings`)
   or `settings.env.json`.

With none of them, it shows nothing. An app with its own settings service,
such as TopoMojo or Gameboard, binds the input or provides the token:

```html
<div class="landing" crucibleLandingBackground
     [crucibleLandingBackgroundSettings]="{ AppLandingBackgroundImage: settings.landingImage }">
```

```ts
providers: [
  {
    provide: CRUCIBLE_LANDING_BACKGROUND_SETTINGS,
    useFactory: () => ({ AppLandingBackgroundImage: inject(AppSettings).landingImage }),
  },
],
```

A new value in the input loads the new image.

## Usage

Import the standalone directive and put it on the landing page's outer
container:

```ts
import { CrucibleLandingBackgroundDirective } from '@cmusei/crucible-common';

@Component({
  // ...
  imports: [CrucibleLandingBackgroundDirective],
})
```

```html
<!-- Always on the landing page -->
<div class="app-container" crucibleLandingBackground>

<!-- Only while no item is open -->
<div class="app-home-container" [crucibleLandingBackground]="!exhibitId">
```

Bind `false` to hide the image. The bare attribute means `true`.

## What it sets

While the image shows, the directive sets on its host:

| Host binding | Light mode | Dark mode |
|---|---|---|
| `background-image` | the image | a near-black tint over the image |
| `background-color` | not set | `#101215` |
| `background-size` / `background-position` | `cover` / `center` | `cover` / `center` |
| `background-attachment` | `fixed` | `fixed` |
| class `crucible-landing-background` | set | set |
| `--crucible-landing-background` | the image's `url(...)` | the image's `url(...)` |

Dark mode follows `CrucibleThemeService.isDarkMode`, so the tint changes with
the theme the app applies through `applyTheme()`. Without
`provideCrucibleTheme()` the image is always shown untinted.

The image is pinned to the window (`background-attachment: fixed`), so it sits
in the same place in every app, whatever the height of its top bar or page.
With `fixed`, `cover` sizes the image to the viewport, not to the host. iOS
Safari ignores `fixed`, so there the image scrolls with the host and covers it.

The directive loads the image first and sets the background only once it
loads. When the setting is empty, the image fails to load (for example a 404),
or the input is `false`, nothing is set and the host keeps the background from
the app's own styles, so a missing image never leaves a dark page. The background is set inline,
so it takes precedence over the app's stylesheet rules for the host.

Once an image has loaded, every directive instance shows it at once, so
returning to the landing page does not flash the app's own background. A host
destroyed before its image loads abandons the download. The load check and the
background are two requests for the same URL, so a server that sends
`Cache-Control: no-store` serves the image twice.

## Content over the image

Panels that sit directly on the page, such as a list with no background of its
own, need a solid surface to stay readable. Key that off the class, in the
component whose template has the container:

```scss
.app-home-container.crucible-landing-background .list-container {
  background-color: var(--mat-sys-surface);
}
```

## Lower-level API

`landingBackgroundUrl(settings)` returns the cleaned URL for
`AppLandingBackgroundImage`: trimmed, with line breaks and form feeds removed.
It is `null` when there is no image. `landingBackgroundImage(settings)` returns
that URL as a CSS `url("...")` value, quoted, with quotes and backslashes
escaped, and `cssUrl(url)` does the same for a URL you already have. The class
and custom property names are exported as `CRUCIBLE_LANDING_BACKGROUND_CLASS`
and `CRUCIBLE_LANDING_BACKGROUND_PROPERTY`. The tint and color are exported as
`CRUCIBLE_LANDING_BACKGROUND_DARK_TINT` and
`CRUCIBLE_LANDING_BACKGROUND_DARK_COLOR`.
