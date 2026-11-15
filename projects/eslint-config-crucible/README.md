# @cmusei/eslint-config-crucible

The shared [ESLint](https://eslint.org/) flat config for the Crucible Angular apps.

It combines:

- `@eslint/js` recommended rules
- `typescript-eslint` `recommendedTypeChecked` and `stylisticTypeChecked`, plus `no-deprecated`
- `angular-eslint` TypeScript, template and template accessibility rules
- rules that keep the Angular migrations in place: standalone components, `inject()`, signal inputs and queries, `output()`, built-in control flow, self-closing tags, `[class]` and `[style]` bindings, no NgModules and no `bootstrapModule()`
- the `eslint-plugin-rxjs-x` rules that find subscriptions that never end, including operators after `takeUntil()` or `takeUntilDestroyed()`
- `no-restricted-globals` for browser globals such as `event`, `name` and `location`
- `eslint-config-prettier` last, so Prettier owns formatting

Generated API clients (`**/generated/**`), `dist/`, `coverage/` and `.angular/` are ignored.

## Use

```bash
npm install --save-dev eslint@^10 @cmusei/eslint-config-crucible
```

`eslint.config.mjs` in the app root:

```js
import { crucible } from '@cmusei/eslint-config-crucible';

export default crucible({ prefix: 'app' });
```

`package.json`:

```json
"scripts": {
  "lint": "eslint ."
}
```

### Options

| Option | Default | Use |
|---|---|---|
| `prefix` | `'app'` | The component and directive selector prefix, or an array of prefixes. |
| `ignores` | `[]` | More paths to ignore, added to the defaults. |
| `strictNullChecks` | `false` | Set to `true` when the app's tsconfig turns on `strictNullChecks` (or `strict`). It turns on `prefer-nullish-coalescing`, which gives wrong advice without it. |

To change a rule for one app, add a block after the shared config:

```js
export default [
  ...crucible({ prefix: 'app' }),
  { files: ['src/app/legacy/**/*.ts'], rules: { '@typescript-eslint/no-explicit-any': 'off' } },
];
```

### Existing errors

An app that starts to use this config can record its existing errors in `eslint-suppressions.json`:

```bash
npx eslint . --suppress-all
```

`eslint .` then fails only on new errors. When a fix removes a suppressed error, ESLint fails until the file is updated with `npx eslint . --prune-suppressions`, so the count can only go down.

## Versions

ESLint 10 and `angular-eslint` 21, for Angular 21. `angular-eslint` 21 requires `@angular/cli` 21, so the package moves to `angular-eslint` 22 when the apps move to Angular 22.

## Development

```bash
cd projects/eslint-config-crucible
npm install
npm test
```

To try a change in an app before a release, install the package from this folder:

```bash
npm install --save-dev ../path/to/Crucible.Common.Ui/projects/eslint-config-crucible
```

Release with the **Release @cmusei/eslint-config-crucible** workflow. It publishes with npm trusted publishing, which npm turns on per package. So the first version needs a manual publish (or an `api-key` run) before the trusted publisher can be added on npmjs.com.
