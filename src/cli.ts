#!/usr/bin/env node
import { execSync } from 'child_process';
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TimePortManager } from './core.js';
import { Logger, validateConfig } from './utils/index.js';

// NOTE: Get the directory path of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));
// NOTE: Go up one level from dist to reach the project root
const ROOT_DIR = join(__dirname, '..');

// NOTE: Read package.json from the project root
const packageJson = JSON.parse(readFileSync(join(ROOT_DIR, 'package.json'), 'utf8'));

const program = new Command();

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

// INFO: Timer commands (need config)
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
		const timePortManager = new TimePortManager();
		await timePortManager.executeCommand('start');
	});

program
	.command('update')
	.description('Update running timer notes')
	.action(async () => {
		const timePortManager = new TimePortManager();
		await timePortManager.executeCommand('update');
	});

program
	.command('stop')
	.description('Stop running timer')
	.action(async () => {
		const timePortManager = new TimePortManager();
		await timePortManager.executeCommand('stop');
	});

// INFO: Default command (interactive mode)
if (process.argv.length === 2) {
	const timeTracker = new TimePortManager();
	timeTracker.run().catch(() => process.exit(1));
} else {
	program.parse();
}
