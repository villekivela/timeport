#!/usr/bin/env node
import { Command } from 'commander';
import { execSync } from 'child_process';
import { App } from '../app.js';
import { validateConfig } from '../config.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));

const program = new Command();

program
	.name('tp')
	.description('TimePort - Bridge between Jira and Harvest time tracking')
	.version(packageJson.version);

validateConfig();

program
	.command('start')
	.description('Start a new timer with Jira issues')
	.action(async () => {
		const app = new App();
		await app.executeCommand('start');
	});

program
	.command('update')
	.description('Update running timer notes')
	.action(async () => {
		const app = new App();
		await app.executeCommand('update');
	});

program
	.command('stop')
	.description('Stop running timer')
	.action(async () => {
		const app = new App();
		await app.executeCommand('stop');
	});

program
	.command('upgrade')
	.description('Upgrade TimePort to the latest version')
	.action(() => {
		try {
			Logger.info('Checking for updates...');
			const currentVersion = program.version();
			Logger.info(`Current version: ${currentVersion}`);
			Logger.info('Upgrading TimePort...');
			execSync('pnpm add -g https://github.com/villekivela/timeport', { stdio: 'inherit' });
			Logger.success('TimePort upgraded successfully!');
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			Logger.error(`Error upgrading TimePort: ${message}`);
			process.exit(1);
		}
	});

// Default command (interactive mode)
if (process.argv.length === 2) {
	const app = new App();
	app.run().catch(() => process.exit(1));
} else {
	program.parse();
}
