import inquirer from 'inquirer';
import { JiraService } from './services/jira.service.js';
import { HarvestService } from './services/harvest.service.js';
import { StartTimerCommand, UpdateTimerCommand, StopTimerCommand } from './commands/index.js';
import { Logger } from './utils/logger.js';
import { Command } from './types/index.js';

type CommandName = 'start' | 'update' | 'stop';

export class App {
	private jiraService: JiraService;
	private commands: Record<CommandName, Command>;

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

	async executeCommand(commandName: CommandName): Promise<void> {
		try {
			const issues = await this.jiraService.fetchUserIssues();
			const command = this.commands[commandName];
			await command.execute(issues);
		} catch (error) {
			Logger.error('Operation failed', error instanceof Error ? error : new Error(String(error)));
			throw error;
		}
	}

	async run(): Promise<void> {
		try {
			const { action } = await inquirer.prompt<{ action: CommandName }>([
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
			Logger.error('Operation failed', error instanceof Error ? error : new Error(String(error)));
			process.exit(1);
		}
	}
}
