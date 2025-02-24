#!/usr/bin/env node
import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

async function updateVersion(newVersion) {
	// Update package.json
	const packagePath = path.join(ROOT_DIR, 'package.json');
	const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
	packageJson.version = newVersion;
	await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

	// Update bin/tp.js
	const tpPath = path.join(ROOT_DIR, 'bin', 'tp.js');
	let tpContent = await fs.readFile(tpPath, 'utf8');
	tpContent = tpContent.replace(/\.version\(['"](.*?)['"]\)/, `.version('${newVersion}')`);
	await fs.writeFile(tpPath, tpContent);

	// Git commands
	try {
		execSync('git add package.json bin/tp.js', { stdio: 'inherit' });
		execSync(`git commit -m "Bump version to ${newVersion}"`, { stdio: 'inherit' });
		execSync(`git tag -a v${newVersion} -m "Version ${newVersion}"`, { stdio: 'inherit' });
		execSync('git push origin main --tags', { stdio: 'inherit' });
		console.log(`Successfully bumped version to ${newVersion}`);
	} catch (error) {
		console.error('Error in Git operations:', error.message);
		process.exit(1);
	}
}

// Get version from command line argument
const newVersion = process.argv[2];
if (!newVersion || !/^\d+\.\d+\.\d+$/.test(newVersion)) {
	console.error('Please provide a valid version number (e.g., 1.0.6)');
	process.exit(1);
}

updateVersion(newVersion);
