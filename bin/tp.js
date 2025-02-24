#!/usr/bin/env node
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { program } from 'commander';
import { TimeTracker } from '../timeport.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.env.NODE_CONFIG_DIR = join(__dirname, '..', 'config');

const timeTracker = new TimeTracker();

program
	.name('tp')
	.description('TimePort - Bridge between Jira and Harvest time tracking')
	.version('1.0.0');

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

program.parse();
