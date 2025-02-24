import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importsPlugin from 'eslint-plugin-import';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    env: {
      node: true,
      es2024: true,
    },
    plugins: {
      import: importsPlugin,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import/extensions': ['error', 'always'],
      'import/no-unresolved': 'error',
    },
  },
  prettier,
]; 