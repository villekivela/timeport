import inquirer from 'inquirer';
import { HarvestService } from '../services/harvest/api.js';
import { Command } from '../types/commands.js';
import { JiraIssue } from '../types/jira.js';
import { Logger } from '../utils/logger.js';
import { generateNotes } from '../utils/note-utils.js';

export class UpdateTimerCommand implements Command {
	constructor(private harvestService: HarvestService) {}

	async execute(issues: JiraIssue[]): Promise<void> {
		const { selectedIssues } = await inquirer.prompt<{ selectedIssues: string[] }>([
			{
				type: 'checkbox',
				name: 'selectedIssues',
				message: 'Select Jira issues to add to timer notes:',
				choices: issues,
				validate: (input) => (input.length > 0 ? true : 'Please select at least one issue'),
			},
		]);

		const notes = generateNotes(selectedIssues, issues);
		await this.harvestService.updateTimer(notes);
		Logger.success('Timer notes updated successfully');
	}
}
