import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['eslint.config.mjs'] },

  eslint.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,

  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        withDefaults: true,
        defineExpose: true,
        defineEmits: true,
        defineProps: true,
      },
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    rules: {
      semi: ['error', 'never'],
      indent: ['error', 4, { SwitchCase: 1 }],
      'no-multi-spaces': 'error',
      'space-unary-ops': ['error', { words: true, nonwords: false }],
      'space-infix-ops': 'error',
      'space-before-blocks': ['error', 'always'],
      'no-mixed-spaces-and-tabs': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-trailing-spaces': 'error',
      'no-whitespace-before-property': 'error',
      'no-irregular-whitespace': 'error',
      'space-in-parens': ['error', 'never'],
      'comma-dangle': ['error', 'never'],
      'array-bracket-spacing': ['error', 'never'],
      'object-curly-spacing': ['error', 'never'],
      'max-len': ['error', { code: 120 }],
      'operator-linebreak': ['error', 'before'],
      'comma-style': ['error', 'last'],
      'no-extra-semi': 'error',
      curly: ['error', 'all'],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'comma-spacing': ['error', { before: false, after: true }],
      'semi-spacing': ['error', { before: false, after: true }],
      camelcase: ['warn', { properties: 'always' }],
      'new-cap': ['error', { newIsCap: true, capIsNew: false }],
      'spaced-comment': ['error', 'always'],
      'no-inline-comments': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-else-return': ['warn', { allowElseIf: false }],
      'no-loop-func': 'error',
      'no-restricted-syntax': [
        'warn',
        {
          selector: "BinaryExpression[operator='instanceof']",
          message: "Use 'instanceof' for object type detection.",
        },
        {
          selector: "BinaryExpression[operator='typeof']",
          message: "Use 'typeof' for type detection.",
        },
        {
          selector: "CallExpression[callee.name='parseInt']",
          message:
            'Use Math.floor, Math.round, or Math.ceil instead of parseInt.',
        },
      ],
      'no-implicit-coercion': ['warn', { allow: ['!!'] }],
      radix: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-array-constructor': 'error',
      'max-lines-per-function': [
        'warn',
        { max: 50, skipComments: true, skipBlankLines: true, IIFEs: true },
      ],
      'max-params': ['warn', 6],
      'no-eval': 'error',
      'prefer-const': 'warn',
      'no-var': 'warn',
      'prefer-destructuring': ['warn', { object: true, array: false }],
      'prefer-template': 'warn',
      'template-curly-spacing': ['error', 'never'],
      'no-duplicate-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },

  {
    files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'],
    plugins: { cypress: require('eslint-plugin-cypress') },
    rules: {
      'cypress/no-assigning-return-values': 'error',
      'cypress/no-unnecessary-waiting': 'error',
      'cypress/assertion-before-screenshot': 'warn',
    },
  },
);
