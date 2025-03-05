/** @type {import('jest').Config} */
export default {
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
	testMatch: ['**/*.test.ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				useESM: true,
				tsconfig: {
					module: 'esnext',
					moduleResolution: 'nodenext',
					target: 'es2022',
					esModuleInterop: true,
					resolveJsonModule: true,
					allowJs: true,
				},
			},
		],
	},
};
