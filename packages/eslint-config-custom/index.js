/* eslint-disable no-undef */
// !! DO NOT USE THIS FILE AS A TEMPLATE OR MODIFY THIS FILE!!

/**
 * @fileoverview This file serves eslint configuration.
 * @date 03/Mar/2023
 * @author Copyright © 2024, Jenga Labs  All rights reserved.
 * @readonly
 * @protected
 */

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:promise/recommended',
    'plugin:import/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'plugin:sonar/recommended',
    'plugin:sonarjs/recommended',
    'plugin:drizzle/all',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-refresh', '@typescript-eslint', 'promise', 'import', '@tanstack/query', 'autofix', 'sonar', 'sonarjs', 'drizzle'],
  rules: {
    'sonarjs/cognitive-complexity': 'off',
    'sonarjs/no-duplicate-string': 'off',
    'react-refresh/only-export-components': 'off',
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'prettier/prettier': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-array-index-key': 'error',
    'require-await': 'error',
    'no-return-await': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'react/self-closing-comp': ['error', { component: true, html: false }],
    // 'autofix/no-unused-vars': [
    //   'error',
    //   {
    //     argsIgnorePattern: '^_',
    //     ignoreRestSiblings: true,
    //     destructuredArrayIgnorePattern: '^_',
    //   },
    // ],
    'no-duplicate-imports': 'off',
    'import/named': 'off',
    'import/no-unresolved': 'off',
    // 'prefer-await-to-then': 'error',
    // 'prefer-await-to-callbacks': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
    'promise/always-return': 'error',
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-native': 'off',
    'promise/no-nesting': 'warn',
    'promise/no-promise-in-callback': 'warn',
    'promise/no-callback-in-promise': 'warn',
    'promise/avoid-new': 'off',
    'promise/no-new-statics': 'error',
    'promise/no-return-in-finally': 'warn',
    'promise/valid-params': 'warn',
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    indent: 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
