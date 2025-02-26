import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importsPlugin from 'eslint-plugin-import';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
	eslint.configs.recommended,
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.node,
			},
		},
		settings: {
			'import/resolver': {
				typescript: true,
				node: true,
			},
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			import: importsPlugin,
		},
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'import/extensions': 'off',
			'import/no-unresolved': 'off',
		},
	},
	prettier,
];
