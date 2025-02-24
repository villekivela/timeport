#!/usr/bin/env node
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { program } from 'commander';
import { TimeTracker } from '../timeport.js';
import { execSync } from 'child_process';

const DIRNAME = dirname(fileURLToPath(import.meta.url));
process.env.NODE_CONFIG_DIR = join(DIRNAME, '..', 'config');

const timeTracker = new TimeTracker();

program
	.name('tp')
	.description('TimePort - Bridge between Jira and Harvest time tracking')
	.version('1.0.4')
	.action(async () => {
		try {
			await timeTracker.run();
		} catch (error) {
			console.error('Error in interactive mode:', error.message);
			process.exit(1);
		}
	});

program
	.command('start')
	.description('Start a timer with Jira issues')
	.action(async () => {
		try {
			await timeTracker.executeCommand('start');
		} catch (error) {
			console.error('Error starting timer:', error.message);
			process.exit(1);
		}
	});

program
	.command('update')
	.description('Update timer notes')
	.action(async () => {
		try {
			await timeTracker.executeCommand('update');
		} catch (error) {
			console.error('Error updating timer:', error.message);
			process.exit(1);
		}
	});

program
	.command('stop')
	.description('Stop timer with optional final notes')
	.action(async () => {
		try {
			await timeTracker.executeCommand('stop');
		} catch (error) {
			console.error('Error stopping timer:', error.message);
			process.exit(1);
		}
	});

program
	.command('upgrade')
	.description('Upgrade TimePort to the latest version')
	.action(() => {
		try {
			console.log('Upgrading TimePort...');
			execSync('pnpm add -g https://github.com/villekivela/timeport', { stdio: 'inherit' });
			console.log('TimePort upgraded successfully!');
		} catch (error) {
			console.error('Error upgrading TimePort:', error.message);
			process.exit(1);
		}
	});

program.parse();
