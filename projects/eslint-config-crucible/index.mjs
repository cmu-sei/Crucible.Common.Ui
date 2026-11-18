// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier/flat';
import rxjs from 'eslint-plugin-rxjs-x';
import confusingGlobals from 'confusing-browser-globals';

/**
 * The shared ESLint config for Crucible Angular apps.
 *
 * @param {object} [options]
 * @param {string | string[]} [options.prefix='app'] Component and directive selector prefix.
 * @param {string[]} [options.ignores=[]] More paths to ignore, added to the defaults.
 * @param {boolean} [options.strictNullChecks=false] Set to true when the app's tsconfig turns on
 *   strictNullChecks (or strict). It turns on the rules that give wrong results without it.
 */
export function crucible({
  prefix = 'app',
  ignores = [],
  strictNullChecks = false,
} = {}) {
  return defineConfig(
    {
      ignores: [
        'dist/',
        'coverage/',
        '.angular/',
        'node_modules/',
        '**/generated/**',
        ...ignores,
      ],
    },
    {
      files: ['**/*.ts'],
      extends: [
        js.configs.recommended,
        tseslint.configs.recommendedTypeChecked,
        tseslint.configs.stylisticTypeChecked,
        angular.configs.tsRecommended,
      ],
      languageOptions: { parserOptions: { projectService: true } },
      processor: angular.processInlineTemplates,
      plugins: { 'rxjs-x': rxjs },
      rules: {
        // From strictTypeChecked: calls to APIs that are marked @deprecated.
        '@typescript-eslint/no-deprecated': 'error',
        // Without strictNullChecks, every type excludes null, so this rule suggests ?? where || is right.
        '@typescript-eslint/prefer-nullish-coalescing': strictNullChecks
          ? 'error'
          : 'off',
        // RxJS subscriptions that never end.
        'rxjs-x/no-sharereplay': ['error', { allowConfig: true }],
        // takeUntilDestroyed() must come last in a pipe too.
        'rxjs-x/no-unsafe-takeuntil': [
          'error',
          { alias: ['takeUntilDestroyed'] },
        ],
        'rxjs-x/no-ignored-replay-buffer': 'error',
        '@angular-eslint/component-selector': [
          'error',
          { type: 'element', prefix, style: 'kebab-case' },
        ],
        '@angular-eslint/directive-selector': [
          'error',
          { type: 'attribute', prefix, style: 'camelCase' },
        ],
        // Keep what the phase 1 Angular migrations changed.
        '@angular-eslint/prefer-standalone': 'error',
        '@angular-eslint/prefer-inject': 'error',
        '@angular-eslint/prefer-signals': 'error',
        '@angular-eslint/prefer-output-emitter-ref': 'error',
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@angular/common',
                importNames: ['CommonModule', 'NgStyle'],
                message:
                  'Import only what the template uses, and bind [style] instead of [ngStyle].',
              },
              {
                name: '@angular/core',
                importNames: ['NgModule'],
                message:
                  'Use standalone components, and put app-wide providers in app.config.ts.',
              },
              {
                name: '@angular/platform-browser-dynamic',
                message:
                  'Bootstrap with bootstrapApplication from @angular/platform-browser.',
              },
            ],
          },
        ],
        'no-restricted-syntax': [
          'error',
          {
            selector:
              "Decorator[expression.callee.name='NgModule'], Decorator[expression.callee.property.name='NgModule']",
            message:
              'Use standalone components, and put app-wide providers in app.config.ts.',
          },
          {
            selector: "CallExpression[callee.property.name='bootstrapModule']",
            message:
              'Bootstrap with bootstrapApplication from @angular/platform-browser.',
          },
        ],
        'no-restricted-globals': ['error', ...confusingGlobals],
      },
    },
    {
      // Tests pass methods to expect() and spies, and use empty stubs.
      files: ['**/*.spec.ts', '**/test-utils/**/*.ts', '**/test-setup.ts'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-empty-function': 'off',
      },
    },
    {
      files: ['**/*.html'],
      extends: [
        angular.configs.templateRecommended,
        angular.configs.templateAccessibility,
      ],
      rules: {
        '@angular-eslint/template/prefer-control-flow': 'error',
        '@angular-eslint/template/prefer-self-closing-tags': 'error',
        '@angular-eslint/template/prefer-class-binding': 'error',
        // Accessibility rules that templateAccessibility leaves out: a positive tabindex breaks the
        // keyboard focus order, and nested <p> or <a> tags are invalid HTML.
        '@angular-eslint/template/no-positive-tabindex': 'error',
        '@angular-eslint/template/no-nested-tags': 'error',
        '@angular-eslint/template/eqeqeq': [
          'error',
          { allowNullOrUndefined: true },
        ],
      },
    },
    prettier,
  );
}

export default crucible();
