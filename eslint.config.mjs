import { crucible } from '@cmusei/eslint-config-crucible';

export default [
  ...crucible({
    // The library's selectors start with crucible or comn; the demo app's with app.
    prefix: ['crucible', 'comn', 'app'],
    // The shared config's test fixtures break its rules on purpose.
    ignores: ['projects/eslint-config-crucible/test/fixtures/**'],
  }),
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
