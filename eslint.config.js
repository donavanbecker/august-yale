import { antfu } from '@antfu/eslint-config'

/** @type {typeof antfu} */
export default antfu(
  {
    ignores: ['dist', 'docs'],
    jsx: false,
    // These publish typedoc documentation, so the doc comments are part of
    // the output rather than incidental - unlike the plugins.
    formatters: {
      markdown: true,
    },
    rules: {
      'curly': ['error', 'multi-line'],
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-line-alignment': 'error',
      'new-cap': 'off',
      'no-undef': 'error',
      'perfectionist/sort-exports': 'error',
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [
            ['type-builtin', 'type-external', 'type-internal'],
            ['type-parent', 'type-sibling', 'type-index'],
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'side-effect',
            'unknown',
          ],
          order: 'asc',
          type: 'natural',
          newlinesBetween: 1,
        },
      ],
      'perfectionist/sort-named-exports': 'error',
      'perfectionist/sort-named-imports': 'error',
      'quotes': ['error', 'single'],
      'sort-imports': 0,
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'style/quote-props': ['error', 'consistent-as-needed'],
      'test/no-only-tests': 'error',
      'unused-imports/no-unused-vars': ['error', { caughtErrors: 'none' }],
    },
    typescript: true,
  },
  {
    files: ['**/*.md'],
    rules: {
      'perfectionist/sort-exports': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-exports': 'off',
      'perfectionist/sort-named-imports': 'off',
    },
  },
  {
    // Only supports JS/TS - eslint errors out if it reaches a markdown or json
    // file with this rule active, which it does when linting the whole repo.
    files: ['**/*.ts', '**/*.js'],
    rules: {
      'unicorn/no-useless-spread': 'error',
    },
  },
  {
    // Code samples inside documentation are illustrative - they assign values
    // to show the shape of the API rather than to use them.
    files: ['**/*.md/**'],
    rules: {
      'antfu/no-top-level-await': 'off',
      'no-console': 'off',
      'no-undef': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },
  {
    // Repository tooling and runnable examples, not library code. Printing to
    // the console is the point of an example, and these are plain node scripts.
    files: ['.github/scripts/**', 'examples/**'],
    rules: {
      'antfu/no-top-level-await': 'off',
      // An example demonstrates consuming the published build, so importing
      // from dist is exactly what it should be doing.
      'antfu/no-import-dist': 'off',
      'no-console': 'off',
      'node/prefer-global/process': 'off',
      'style/max-statements-per-line': 'off',
    },
  },
)
