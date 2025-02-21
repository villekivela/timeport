import inquirer from 'inquirer';
import { JiraService } from './services/jira.service.js';
import { HarvestService } from './services/harvest.service.js';
import { StartTimerCommand, UpdateTimerCommand, StopTimerCommand } from './commands/index.js';
import { Logger } from './utils/logger.js';

class TimeTracker {
	constructor() {
		const jiraService = new JiraService();
		const harvestService = new HarvestService();

		this.jiraService = jiraService;
		this.commands = {
			start: new StartTimerCommand(harvestService),
			update: new UpdateTimerCommand(harvestService),
			stop: new StopTimerCommand(harvestService),
		};
	}

	async run() {
		try {
			const issues = await this.jiraService.fetchUserIssues();

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

			const command = this.commands[action];
			await command.execute(issues);
		} catch (error) {
			Logger.error('Operation failed', error);
			process.exit(1);
		}
	}
}

const timeTracker = new TimeTracker();
timeTracker.run();
