#!/usr/bin/env node
import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

async function updateVersion(newVersion) {
	try {
		// NOTE: Update package.json
		const packagePath = path.join(ROOT_DIR, 'package.json');
		console.log('Reading package.json from:', packagePath);
		const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
		console.log('Current version:', packageJson.version);
		packageJson.version = newVersion;
		await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
		console.log('Updated package.json version to:', newVersion);

		console.log('Building TypeScript...');
		execSync('pnpm run build', { stdio: 'inherit' });

		console.log('Running version tests...');
		execSync('pnpm run test:version', { stdio: 'inherit' });

		console.log('Committing changes...');
		execSync('git add package.json', { stdio: 'inherit' });
		execSync(`git commit -m "Bump version to ${newVersion}"`, { stdio: 'inherit' });
		execSync(`git tag -a v${newVersion} -m "Version ${newVersion}"`, { stdio: 'inherit' });
		execSync('git push origin main --tags', { stdio: 'inherit' });
		console.log(`Successfully bumped version to ${newVersion}`);
	} catch (error) {
		console.error(
			'Error updating version:',
			error instanceof Error ? error.message : String(error)
		);
		process.exit(1);
	}
}

const newVersion = process.argv[2];
if (!newVersion) {
	console.error('Please provide a version number');
	process.exit(1);
}

// NOTE: Validate version format
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
	console.error('Version must be in format X.Y.Z');
	process.exit(1);
}

updateVersion(newVersion);
