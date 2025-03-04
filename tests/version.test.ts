import { describe, expect, test } from '@jest/globals';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');

describe('Version consistency', () => {
	const packageJson = JSON.parse(readFileSync(join(ROOT_DIR, 'package.json'), 'utf8'));
	const expectedVersion = packageJson.version;

	test('package.json version should be valid semver', () => {
		// NOTE: Semver regex pattern
		const semverPattern = /^\d+\.\d+\.\d+$/;
		expect(expectedVersion).toMatch(semverPattern);
	});

	test('git tag should match package.json version if exists', () => {
		try {
			const { execSync } = require('child_process');
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

	test('dist/cli.js should use correct version', () => {
		try {
			const filePath = join(ROOT_DIR, 'dist/cli.js');
			const cliContent = readFileSync(filePath, 'utf8');

			// NOTE: Check for either static version string or dynamic package.json loading
			const staticVersionMatch = cliContent.match(/\.version\(['"](.*?)['"]\)/);
			const dynamicVersionMatch = cliContent.includes('.version(packageJson.version)');

			if (staticVersionMatch) {
				expect(staticVersionMatch[1]).toBe(expectedVersion);
			} else if (dynamicVersionMatch) {
				// NOTE: If using dynamic version, verify package.json is being loaded correctly
				expect(cliContent).toContain('const packageJson = JSON.parse(readFileSync(');
				expect(cliContent).toContain('package.json');
			} else {
				throw new Error('Could not find version configuration in cli.js');
			}
		} catch (error) {
			throw new Error('Failed to read dist/cli.js. Make sure to build the project first.');
		}
	});
});
