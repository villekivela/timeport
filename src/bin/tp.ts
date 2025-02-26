#!/usr/bin/env node
import { Command } from 'commander';
import { execSync } from 'child_process';
import { TimeTracker } from '../timeport.js';
import { validateConfig } from '../config.js';

const program = new Command();

validateConfig();

program
	.name('tp')
	.description('CLI tool to bridge time tracking between Jira and Harvest')
	.version('1.0.9');

program
	.command('start')
	.description('Start a new timer with Jira issues')
	.action(async () => {
		const timeTracker = new TimeTracker();
		await timeTracker.executeCommand('start');
	});

program
	.command('update')
	.description('Update running timer notes')
	.action(async () => {
		const timeTracker = new TimeTracker();
		await timeTracker.executeCommand('update');
	});

program
	.command('stop')
	.description('Stop running timer')
	.action(async () => {
		const timeTracker = new TimeTracker();
		await timeTracker.executeCommand('stop');
	});

program
	.command('upgrade')
	.description('Upgrade TimePort to the latest version')
	.action(() => {
		try {
			console.log('Checking for updates...');
			const currentVersion = program.version();
			console.log(`Current version: ${currentVersion}`);
			console.log('Upgrading TimePort...');
			execSync('pnpm add -g https://github.com/villekivela/timeport', { stdio: 'inherit' });
			console.log('TimePort upgraded successfully!');
		} catch (error) {
			console.error(
				'Error upgrading TimePort:',
				error instanceof Error ? error.message : String(error)
			);
			process.exit(1);
		}
	});

// Default command (interactive mode)
if (process.argv.length === 2) {
	const timeTracker = new TimeTracker();
	timeTracker.run().catch(() => process.exit(1));
} else {
	program.parse();
}
