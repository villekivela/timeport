import inquirer from 'inquirer';
import { HarvestService } from '../services/harvest/index.js';
import { Command, JiraIssue } from '../types/index.js';
import { Logger } from '../utils/index.js';
import { generateNotes } from '../utils/note-utils.js';

export class StartTimerCommand implements Command {
	constructor(private harvestService: HarvestService) {}

	async execute(issues: JiraIssue[]): Promise<void> {
		const stoppedEntries = await this.harvestService.getStoppedTimeEntriesForToday();

		if (stoppedEntries.length > 0) {
			const latestEntry = stoppedEntries[0];

			const { startExisting } = await inquirer.prompt<{ startExisting: boolean }>([
				{
					type: 'confirm',
					name: 'startExisting',
					message: `There is a stopped timer from today. Would you like to start it again? Notes: ${latestEntry.notes || 'No notes'}`,
					default: true,
				},
			]);

			if (startExisting) {
				await this.harvestService.restartTimer(latestEntry.id);
				Logger.success('Existing timer restarted successfully');
				return;
			}
		}

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

			const notes = generateNotes(selectedIssues, issues);
			await this.harvestService.startTimer(notes);
		} else {
			await this.harvestService.startTimer();
		}

		Logger.success('Timer started successfully');
	}
}
