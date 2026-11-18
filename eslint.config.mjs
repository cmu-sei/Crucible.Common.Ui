import { crucible } from '@cmusei/eslint-config-crucible';

const selectorPrefix = (prefix) => ({
  '@angular-eslint/component-selector': [
    'error',
    { type: 'element', prefix, style: 'kebab-case' },
  ],
  '@angular-eslint/directive-selector': [
    'error',
    { type: 'attribute', prefix, style: 'camelCase' },
  ],
});

export default [
  ...crucible({
    ignores: [
      // The shared config's test fixtures break its rules on purpose.
      'projects/eslint-config-crucible/test/fixtures/**',
      // Protractor e2e harness: CI does not run it, and its Jasmine types are not installed,
      // so ESLint cannot type-check it.
      'projects/cwd-common-app/e2e/**',
    ],
  }),
  // The library's selectors start with crucible or comn; the demo app's with app.
  {
    files: ['projects/@crucible-common/**/*.ts'],
    rules: selectorPrefix(['crucible', 'comn']),
  },
  { files: ['projects/cwd-common-app/**/*.ts'], rules: selectorPrefix('app') },
  {
    // The specs use Vitest's globals, which only each project's tsconfig.spec.json declares;
    // the project service would pick the root tsconfig.json and leave describe/it/expect untyped.
    files: ['projects/*/src/**/*.spec.ts'],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: [
          'projects/@crucible-common/tsconfig.spec.json',
          'projects/cwd-common-app/tsconfig.spec.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
