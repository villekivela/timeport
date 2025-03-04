import inquirer from 'inquirer';
import { StartTimerCommand, StopTimerCommand, UpdateTimerCommand } from './commands/index.js';
import { HarvestAuthService } from './services/harvest-auth.service.js';
import { HarvestService } from './services/harvest.service.js';
import { JiraService } from './services/jira.service.js';
import { Command } from './types/index.js';
import { Logger } from './utils/logger.js';

type CommandName = 'start' | 'update' | 'stop';

export class App {
	#jiraService: JiraService;
	#harvestService: HarvestService;
	#commands: Record<CommandName, Command>;

	constructor() {
		this.#jiraService = new JiraService();
		this.#harvestService = new HarvestService();
		this.#commands = {
			start: new StartTimerCommand(this.#harvestService),
			update: new UpdateTimerCommand(this.#harvestService),
			stop: new StopTimerCommand(this.#harvestService),
		};
	}

	async #ensureAuthenticated(): Promise<void> {
		const authService = new HarvestAuthService();
		await authService.authenticate();
	}

	async executeCommand(commandName: CommandName): Promise<void> {
		try {
			await this.#ensureAuthenticated();
			const issues = await this.#jiraService.fetchUserIssues();
			const command = this.#commands[commandName];
			await command.execute(issues);
		} catch (error) {
			Logger.error('Operation failed', error instanceof Error ? error : new Error(String(error)));
			throw error;
		}
	}

	async run(): Promise<void> {
		try {
			await this.#ensureAuthenticated();
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
