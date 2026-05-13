import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const typeCheckedExtends = [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked];

const reactPlugins = {
  'react-hooks': reactHooks,
  'react-refresh': reactRefresh,
};

const reactRules = {
  ...reactHooks.configs.recommended.rules,
  'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  '@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
};

export default tseslint.config(
  { ignores: ['dist', 'legacy', 'vitest.config.ts'] },
  {
    extends: typeCheckedExtends,
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: reactPlugins,
    rules: reactRules,
  },
  {
    extends: typeCheckedExtends,
    files: ['vite.config.ts', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        project: ['./tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: reactPlugins,
    rules: reactRules,
  },
);
