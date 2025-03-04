import inquirer from 'inquirer';
import { HarvestService } from '../services/harvest/api.js';
import { Command } from '../types/commands.js';
import { JiraIssue } from '../types/jira.js';
import { Logger } from '../utils/logger.js';

export class StopTimerCommand implements Command {
	constructor(private harvestService: HarvestService) {}

	async execute(issues: JiraIssue[]): Promise<void> {
		const { addNotes } = await inquirer.prompt<{ addNotes: boolean }>([
			{
				type: 'confirm',
				name: 'addNotes',
				message: 'Would you like to add final notes before stopping the timer?',
				default: false,
			},
		]);

		if (addNotes) {
			const { selectedIssues } = await inquirer.prompt<{ selectedIssues: string[] }>([
				{
					type: 'checkbox',
					name: 'selectedIssues',
					message: 'Select Jira issues:',
					choices: issues,
				},
			]);

			const notes = selectedIssues
				.map((issueKey) => issues.find((issue) => issue.value === issueKey)?.name.trim())
				.filter(Boolean)
				.join(', ');

			await this.harvestService.stopTimer(notes);
		} else {
			await this.harvestService.stopTimer();
		}

		Logger.success('Timer stopped successfully');
	}
}
