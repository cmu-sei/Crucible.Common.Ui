// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import { crucible } from './index.mjs';

const untyped = (code, file) =>
  new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      ...crucible(),
      // These tests lint snippets with no tsconfig, so turn off the rules that need types.
      {
        files: ['**/*.ts'],
        ...tseslint.configs.disableTypeChecked,
        languageOptions: { parserOptions: { projectService: false } },
      },
      {
        files: ['**/*.ts'],
        rules: {
          '@typescript-eslint/no-deprecated': 'off',
          'rxjs-x/no-sharereplay': 'off',
          'rxjs-x/no-unsafe-takeuntil': 'off',
          'rxjs-x/no-ignored-replay-buffer': 'off',
        },
      },
    ],
  }).lintText(code, { filePath: file });
const ruleIds = async (code, file = 'src/main.ts') =>
  (await untyped(code, file))[0].messages.map((m) => m.ruleId);

const eslint = (options) =>
  new ESLint({ overrideConfigFile: true, overrideConfig: crucible(options) });
const severity = (rule) => (Array.isArray(rule) ? rule[0] : rule);

test('TypeScript files get the typed, Angular and phase 1 rules', async () => {
  const { rules } = await eslint().calculateConfigForFile(
    'src/app/app.component.ts',
  );
  for (const rule of [
    '@typescript-eslint/no-floating-promises',
    '@typescript-eslint/no-deprecated',
    '@angular-eslint/prefer-standalone',
    '@angular-eslint/prefer-inject',
    '@angular-eslint/prefer-signals',
    '@angular-eslint/prefer-output-emitter-ref',
    'no-restricted-imports',
    'no-restricted-syntax',
    'rxjs-x/no-sharereplay',
  ]) {
    assert.equal(severity(rules[rule]), 2, rule);
  }
});

test('templates get the control flow, class binding and accessibility rules', async () => {
  const { rules } = await eslint().calculateConfigForFile(
    'src/app/app.component.html',
  );
  for (const rule of [
    '@angular-eslint/template/prefer-control-flow',
    '@angular-eslint/template/prefer-self-closing-tags',
    '@angular-eslint/template/prefer-class-binding',
    '@angular-eslint/template/click-events-have-key-events',
    '@angular-eslint/template/no-positive-tabindex',
    '@angular-eslint/template/no-nested-tags',
  ]) {
    assert.equal(severity(rules[rule]), 2, rule);
  }
});

test('the selector prefix is configurable', async () => {
  const { rules } = await eslint({ prefix: 'cas' }).calculateConfigForFile(
    'src/app/x.component.ts',
  );
  assert.equal(rules['@angular-eslint/component-selector'][1].prefix, 'cas');
});

test('prefer-nullish-coalescing waits for strictNullChecks', async () => {
  const off = await eslint().calculateConfigForFile('src/app/x.ts');
  const on = await eslint({ strictNullChecks: true }).calculateConfigForFile(
    'src/app/x.ts',
  );
  assert.equal(
    severity(off.rules['@typescript-eslint/prefer-nullish-coalescing']),
    0,
  );
  assert.equal(
    severity(on.rules['@typescript-eslint/prefer-nullish-coalescing']),
    2,
  );
});

test('generated code and build output are ignored', async () => {
  const lint = eslint();
  assert.equal(
    await lint.isPathIgnored('src/app/generated/api/api.module.ts'),
    true,
  );
  assert.equal(await lint.isPathIgnored('dist/main.js'), true);
});

test('prettier turns off the format rules', async () => {
  const { rules } = await eslint().calculateConfigForFile('src/app/x.ts');
  assert.equal(severity(rules['@typescript-eslint/no-extra-semi'] ?? 'off'), 0);
  assert.equal(severity(rules['no-mixed-spaces-and-tabs'] ?? 'off'), 0);
});

test('NgModules and bootstrapModule are not allowed', async () => {
  assert.ok(
    (
      await ruleIds(
        "import { NgModule } from '@angular/core';\n@NgModule({})\nexport class AppModule {}\n",
      )
    ).includes('no-restricted-syntax'),
  );
  assert.ok(
    (
      await ruleIds(
        "import { platformBrowser } from '@angular/platform-browser';\nimport { AppModule } from './app.module';\nvoid platformBrowser().bootstrapModule(AppModule);\n",
      )
    ).includes('no-restricted-syntax'),
  );
  assert.ok(
    (
      await ruleIds(
        "import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';\nexport const p = platformBrowserDynamic;\n",
      )
    ).includes('no-restricted-imports'),
  );
  assert.deepEqual(
    await ruleIds(
      "import { bootstrapApplication } from '@angular/platform-browser';\nimport { App } from './app';\nvoid bootstrapApplication(App, {});\n",
    ),
    [],
  );
});

test('CommonModule and NgStyle imports are not allowed, NgClass is', async () => {
  const ids = await ruleIds(
    "import { CommonModule, NgStyle, NgClass } from '@angular/common';\nexport const m = [CommonModule, NgStyle, NgClass];\n",
  );
  assert.equal(ids.filter((id) => id === 'no-restricted-imports').length, 2);
});

test('operators after takeUntil() or takeUntilDestroyed() are errors', async () => {
  const [result] = await eslint().lintFiles([
    'test/fixtures/take-until-destroyed.ts',
  ]);
  const lines = result.messages
    .filter((m) => m.ruleId === 'rxjs-x/no-unsafe-takeuntil')
    .map((m) => m.line);
  assert.deepEqual(lines, [11, 19]);
});

test('NgModule is not allowed by any import name', async () => {
  const aliased = await ruleIds(
    "import { NgModule as Module } from '@angular/core';\n@Module({})\nexport class AppModule {}\n",
  );
  assert.ok(aliased.includes('no-restricted-imports'));
  const namespaced = await ruleIds(
    "import * as ng from '@angular/core';\n@ng.NgModule({})\nexport class AppModule {}\n",
  );
  assert.ok(namespaced.includes('no-restricted-syntax'));
});

test('a positive tabindex is an error, 0 and -1 are not', async () => {
  const ids = async (html) =>
    (await untyped(html, 'src/app/x.component.html'))[0].messages.map(
      (m) => m.ruleId,
    );
  assert.ok(
    (await ids('<input tabindex="1" />\n')).includes(
      '@angular-eslint/template/no-positive-tabindex',
    ),
  );
  assert.ok(
    !(
      await ids('<input tabindex="0" />\n<div tabindex="-1"></div>\n')
    ).includes('@angular-eslint/template/no-positive-tabindex'),
  );
});
