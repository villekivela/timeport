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

program.version('1.2.0'); // VERSION STRING

program
	.name('tp')
	.description('TimePort - Bridge between Jira and Harvest time tracking')
	.version(packageJson.version);

program
	.command('upgrade')
	.description('Upgrade TimePort to the latest version')
	.action(() => {
		try {
			Logger.info('Upgrading TimePort...');
			execSync('pnpm add -g https://github.com/villekivela/timeport', { stdio: 'inherit' });
			Logger.success('TimePort upgraded successfully');
		} catch (error) {
			Logger.error(
				'Failed to upgrade TimePort',
				error instanceof Error ? error : new Error(String(error))
			);
			process.exit(1);
		}
	});

program
	.command('uninstall')
	.description('Uninstall TimePort')
	.action(() => {
		try {
			Logger.info('Uninstalling TimePort...');
			execSync('pnpm remove -g timeport', { stdio: 'inherit' });
			Logger.success('TimePort uninstalled successfully');
		} catch (error) {
			Logger.error(
				'Failed to uninstall TimePort',
				error instanceof Error ? error : new Error(String(error))
			);
			process.exit(1);
		}
	});

// Timer commands (need config)
const timerCommands = ['start', 'stop', 'update'];
if (
	(process.argv.length > 2 && timerCommands.includes(process.argv[2])) ||
	process.argv.length === 2
) {
	validateConfig();
}

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

// Default command (interactive mode)
if (process.argv.length === 2) {
	const app = new App();
	app.run().catch(() => process.exit(1));
} else {
	program.parse();
}
