import inquirer from 'inquirer';
import { JiraService } from './services/jira.service.js';
import { HarvestService } from './services/harvest.service.js';
import { StartTimerCommand, UpdateTimerCommand, StopTimerCommand } from './commands/index.js';
import { Logger } from './utils/logger.js';

/**
 * Main application class that handles time tracking operations
 */
export class TimeTracker {
	/**
	 * Initialize TimeTracker with services and commands
	 */
	constructor() {
		const jiraService = new JiraService();
		const harvestService = new HarvestService();

		this.jiraService = jiraService;
		/** @type {Object.<string, import('./commands/index.js').StartTimerCommand | import('./commands/index.js').UpdateTimerCommand | import('./commands/index.js').StopTimerCommand>} */
		this.commands = {
			start: new StartTimerCommand(harvestService),
			update: new UpdateTimerCommand(harvestService),
			stop: new StopTimerCommand(harvestService),
		};
	}

	/**
	 * Execute a specific command
	 * @param {string} commandName - The name of the command to execute
	 * @returns {Promise<void>}
	 */
	async executeCommand(commandName) {
		try {
			const issues = await this.jiraService.fetchUserIssues();
			const command = this.commands[commandName];
			await command.execute(issues);
		} catch (error) {
			Logger.error('Operation failed', error);
			throw error;
		}
	}

	/**
	 * Run the time tracker application in interactive mode
	 * Fetches Jira issues and handles user commands
	 * @returns {Promise<void>}
	 */
	async run() {
		try {
			const { action } = await inquirer.prompt([
				{
					type: 'list',
					name: 'action',
					message: 'What would you like to do?',
					choices: [
						{ name: 'Start new timer', value: 'start' },
						{ name: 'Update running timer notes', value: 'update' },
						{ name: 'Stop running timer', value: 'stop' },
					],
				},
			]);

			await this.executeCommand(action);
		} catch (error) {
			Logger.error('Operation failed', error);
			process.exit(1);
		}
	}
}
