# crucible-landing-background

Shows an operator-supplied image behind a Crucible app's landing page. The
image is configured per site, so it never ships in an app's repository.

## Setting

| Setting | Description |
|---|---|
| `AppLandingBackgroundImage` | URL of the image. Empty, blank or missing shows no image. |

The key is read from `ComnSettingsService.settings`, so it can be set in
`settings.json`, `settings.shared.json` (to share it across apps, like
`HeaderBarSettings`) or `settings.env.json`. It is read once, when the
directive is created.

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
| class `crucible-landing-background` | set | set |
| `--crucible-landing-background` | the image's `url(...)` | the image's `url(...)` |

Dark mode follows `CrucibleThemeService.isDarkMode`, so the tint changes with
the theme the app applies through `applyTheme()`. Without
`provideCrucibleTheme()` the image is always shown untinted.

When the setting is empty or the input is `false`, nothing is set and the host
keeps the background from the app's own styles. The background is set inline,
so it takes precedence over the app's stylesheet rules for the host.

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

`landingBackgroundImage(settings)` returns the CSS `url("...")` value for
`AppLandingBackgroundImage`, or `null` when there is no image. It quotes the
URL and escapes quotes and backslashes. The tint and color are exported as
`CRUCIBLE_LANDING_BACKGROUND_DARK_TINT` and
`CRUCIBLE_LANDING_BACKGROUND_DARK_COLOR`.
