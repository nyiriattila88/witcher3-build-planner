// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import importX, { createNodeResolver } from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const LAYERS =
  'A layer imports only from the layers above it, see How the code is split in AGENTS.md.';

export default defineConfig(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { 'import-x': importX },
    settings: {
      // The import rules follow relative imports to the TypeScript files they name.
      'import-x/resolver-next': [createNodeResolver({ extensions: ['.ts', '.tsx', '.js'] })],
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      // `type` is the house default, `interface` only for declaration merging.
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      // A number prints predictably, the rule is here for objects and undefined.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      'import-x/no-default-export': 'error',
      // Each layer imports only from the layers above it: data, catalog, build, planner, app.
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/data',
              from: ['./src/catalog', './src/build', './src/planner', './src/app'],
              message: LAYERS,
            },
            {
              target: './src/catalog',
              from: ['./src/build', './src/planner', './src/app'],
              message: LAYERS,
            },
            { target: './src/build', from: ['./src/planner', './src/app'], message: LAYERS },
            { target: './src/planner', from: './src/app', message: LAYERS },
          ],
        },
      ],
      'no-console': ['error', { allow: ['error'] }],
      eqeqeq: ['error', 'always'],
    },
  },
  {
    // The game rules know nothing about React.
    files: ['src/data/**', 'src/catalog/**', 'src/build/**'],
    rules: { 'no-restricted-imports': ['error', { patterns: ['react', 'react-*', 'react/*'] }] },
  },
  {
    // The tools read their configuration from a default export.
    files: ['*.config.{js,ts}'],
    rules: { 'import-x/no-default-export': 'off' },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettier,
);
