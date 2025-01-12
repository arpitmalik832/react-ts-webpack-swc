import babelParser from '@babel/eslint-parser';
import mdxParser from 'eslint-mdx';
import tsEslint from 'typescript-eslint';
import globals from 'globals';
import * as mdxPlugin from 'eslint-plugin-mdx';
import path from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import storybookPlugin from 'eslint-plugin-storybook';
import jestPlugin from 'eslint-plugin-jest';
import cypressPlugin from 'eslint-plugin-cypress/flat';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const compat = new FlatCompat({
  baseDirectory: dirname,
});

const jsFiles = ['**/*.?(c|m)js?(x)'];
const tsFiles = ['**/*.?(c|m)ts?(x)'];
const mdFiles = ['**/*.md?(x)'];
const jestFiles = ['**/*/__tests__/**/*.@(test|spec).@(t|j)s?(x)'];
const e2eFiles = ['**/*.@(cy).@(t|j)s?(x)'];

export default [
  {
    ignores: [
      'node_modules/*',
      'dist/*',
      'build/*',
      'coverage/*',
      'cypress/fixtures',
      'cypress/downloads',
      'cypress/videos',
      'cypress/screenshots',
      'storybook-static',
      '**/*.md',
      'distInfo/*',
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        NodeJS: true,
        BlobPart: true,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 2,
    },
  },
  ...compat.config({
    extends: ['airbnb', 'plugin:css-modules/recommended', 'prettier'],
    plugins: ['css-modules', 'prettier'],
    rules: {
      'css-modules/no-unused-class': [
        2,
        {
          camelCase: true,
        },
      ],
      'css-modules/no-undef-class': [
        2,
        {
          camelCase: true,
        },
      ],
      'prettier/prettier': [
        1,
        {
          endOfLine: 'lf',
        },
      ],
    },
  }),
  {
    files: [...tsFiles, ...jsFiles, ...mdFiles],
    ...js.configs.recommended,
    ...importPlugin.flatConfigs.recommended,
    ...jsxA11yPlugin.flatConfigs.strict,
    ...reactPlugin.configs.flat.all,
    ...reactPlugin.configs.flat['jsx-runtime'],
    ...reactHooksPlugin.configs.recommended,
    plugins: {
      import: importPlugin,
      'jsx-a11y': jsxA11yPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react/react-in-jsx-scope': 0,
      'react/function-component-definition': 0,
      'react/prop-types': 0,
      'react/jsx-filename-extension': [
        0,
        {
          extensions: ['.tsx'],
        },
      ],
      'react/require-default-props': 0,
      'react-hooks/rules-of-hooks': 2,
      'react-hooks/exhaustive-deps': 0,
      'import/no-extraneous-dependencies': [
        2,
        {
          packageDir: '.',
        },
      ],
      'import/prefer-default-export': 0,
      'import/extensions': [
        2,
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'import/no-unresolved': [
        2,
        {
          ignore: [
            'typescript-eslint',
            '@arpitmalik832/react-ts-rollup-library/.*\\.css$',
            'react-dom/client',
            'eslint-plugin-cypress/flat',
          ],
        },
      ],
      'jsx-a11y/anchor-is-valid': 2,
      'no-console': 2,
      'no-debugger': 2,
      'no-unused-vars': 2,
      'prefer-destructuring': 2,
      'func-names': 2,
      camelcase: 1,
    },
  },
  ...tsEslint.config({
    files: tsFiles,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [
      js.configs.recommended,
      ...tsEslint.configs.recommendedTypeChecked,
      ...tsEslint.configs.stylisticTypeChecked,
    ],
  }),
  {
    files: tsFiles,
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.ts', '.tsx'],
        },
      },
    },
  },
  {
    files: jestFiles,
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals,
      },
    },
  },
  {
    files: e2eFiles,
    ...cypressPlugin.configs.recommended,
  },
  ...storybookPlugin.configs['flat/recommended'],
  {
    files: jsFiles,
    languageOptions: {
      parser: babelParser,
      ecmaVersion: 6,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: [
            [
              '@babel/preset-react',
              {
                runtime: 'automatic',
              },
            ],
            '@babel/preset-env',
          ],
        },
      },
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
        },
      },
    },
  },
  {
    ...mdxPlugin.flat,
    ...mdxPlugin.flatCodeBlocks,
    files: mdFiles,
    languageOptions: {
      parser: mdxParser,
      parserOptions: {
        extensions: [...mdFiles, ...jsFiles, ...tsFiles],
        markdownExtensions: [...mdFiles, ...jsFiles, ...tsFiles],
      },
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.ts', '.tsx'],
        },
      },
    },
    processor: mdxPlugin.createRemarkProcessor({
      lintCodeBlocks: true,
      languageMapper: {},
    }),
    rules: {
      ...mdxPlugin.flatCodeBlocks.rules,
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
];
