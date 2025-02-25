const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettier = require('eslint-config-prettier');
const eslintComments = require('eslint-plugin-eslint-comments');
const importPlugin = require('eslint-plugin-import');
const eslintPluginPrettier = require('eslint-plugin-prettier');
const jestPlugin = require('eslint-plugin-jest');
const sortDestructureKeys = require('eslint-plugin-sort-destructure-keys');
const sortKeysFix = require('eslint-plugin-sort-keys-fix');
const typescriptSortKeys = require('eslint-plugin-typescript-sort-keys');

module.exports = [
  {
    languageOptions: {
      globals: {
        process: true,
        module: true,
        require: true,
        Buffer: true,
        console: true,
        setTimeout: true,
      },
    },
  },
  eslint.configs.recommended,
  prettier,
  {
    ignores: ['/dist/*'],
  },
  {
    files: ['**/*.test.ts'],
    plugins: {
      jest: jestPlugin,
    },
    extends: ['plugin:jest/recommended'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        project: ['./tsconfig.json', './tsconfig.test.json'],
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'eslint-comments': eslintComments,
      import: importPlugin,
      prettier: eslintPluginPrettier,
      'sort-destructure-keys': sortDestructureKeys,
      'sort-keys-fix': sortKeysFix,
      'typescript-sort-keys': typescriptSortKeys,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'eslint-comments/no-unused-disable': 'error',
      'import/order': [
        'error',
        {
          alphabetize: {
            caseInsensitive: true,
            order: 'asc',
          },
          groups: ['builtin', 'external', 'internal', 'sibling', 'parent', 'index', 'object', 'type'],
          'newlines-between': 'always',
        },
      ],
      'prettier/prettier': 'error',
      'sort-destructure-keys/sort-destructure-keys': [2, { caseSensitive: false }],
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      'sort-keys-fix/sort-keys-fix': ['error', 'asc', { caseSensitive: false, natural: false }],
      'typescript-sort-keys/interface': ['error', 'asc', { caseSensitive: false, natural: true, requiredFirst: true }],
      'typescript-sort-keys/string-enum': ['error', 'asc', { caseSensitive: false, natural: true }],
    },
  },
];
