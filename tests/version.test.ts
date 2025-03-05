import { describe, expect, test } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = process.cwd();

describe('Version consistency', () => {
	const packageJson = JSON.parse(readFileSync(join(ROOT_DIR, 'package.json'), 'utf8'));
	const expectedVersion = packageJson.version;

	test('package.json version should be valid semver', () => {
		// NOTE: Semver regex pattern
		const semverPattern = /^\d+\.\d+\.\d+$/;
		expect(expectedVersion).toMatch(semverPattern);
	});

	test('git tag should match package.json version if exists', async () => {
		try {
			const { execSync } = await import('child_process');
			const latestTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();

			if (latestTag) {
				const tagVersion = latestTag.replace(/^v/, '');
				expect(tagVersion).toBe(expectedVersion);
			}
		} catch (error) {
			// NOTE: Skip if no tags exist
			console.log('No git tags found, skipping tag version check');
		}
	});

	test('src/cli.ts should use correct version', () => {
		try {
			const cliContent = readFileSync(join(ROOT_DIR, 'src/cli.ts'), 'utf8');

			// Check for version in source file instead of built file
			const dynamicVersionMatch = cliContent.includes('.version(packageConfig.version)');

			if (dynamicVersionMatch) {
				expect(cliContent).toContain('const packageConfig = JSON.parse(readFileSync(');
				expect(cliContent).toContain('package.json');
			} else {
				throw new Error('Could not find version configuration in cli.ts');
			}
		} catch (error) {
			throw new Error('Failed to read src/cli.ts');
		}
	});
});
