import inquirer from 'inquirer';
import { HarvestService } from '../services/harvest/index.js';
import { Command, JiraIssue } from '../types/index.js';
import { Logger } from '../utils/index.js';

export class StartTimerCommand implements Command {
	constructor(private harvestService: HarvestService) {}

	async execute(issues: JiraIssue[]): Promise<void> {
		const { addNotes } = await inquirer.prompt<{ addNotes: boolean }>([
			{
				type: 'confirm',
				name: 'addNotes',
				message: 'Would you like to add Jira issues to the timer?',
				default: true,
			},
		]);

		if (addNotes) {
			const { selectedIssues } = await inquirer.prompt<{ selectedIssues: string[] }>([
				{
					type: 'checkbox',
					name: 'selectedIssues',
					message: 'Select Jira issues:',
					choices: issues,
					validate: (input) => (input.length > 0 ? true : 'Please select at least one issue'),
				},
			]);

			const notes = selectedIssues
				.map((issueKey) => issues.find((issue) => issue.value === issueKey)?.name.trim())
				.filter(Boolean)
				.join(', ');

			await this.harvestService.startTimer(notes);
		} else {
			await this.harvestService.startTimer();
		}

		Logger.success('Timer started successfully');
	}
}
