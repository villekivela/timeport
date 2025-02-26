#!/usr/bin/env node
import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../../');

async function updateVersion(newVersion: string): Promise<void> {
	try {
		// Update package.json
		const packagePath = path.join(ROOT_DIR, 'package.json');
		const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
		packageJson.version = newVersion;
		await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

		// Update bin/tp.ts
		const tpPath = path.join(ROOT_DIR, 'src', 'bin', 'tp.ts');
		let tpContent = await fs.readFile(tpPath, 'utf8');
		tpContent = tpContent.replace(/\.version\(['"](.*?)['"]\)/, `.version('${newVersion}')`);
		await fs.writeFile(tpPath, tpContent);

		// Build TypeScript
		execSync('pnpm run build', { stdio: 'inherit' });

		// Git commands
		execSync('git add package.json src/bin/tp.ts', { stdio: 'inherit' });
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

// Get version from command line argument
const newVersion = process.argv[2];
if (!newVersion) {
	console.error('Please provide a version number');
	process.exit(1);
}

updateVersion(newVersion).catch((error) => {
	console.error('Error updating version:', error);
	process.exit(1);
});
