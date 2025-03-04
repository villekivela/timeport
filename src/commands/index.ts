import inquirer from 'inquirer';
import { HarvestService } from '../services/harvest.service.js';
import { Command, JiraIssue } from '../types/index.js';
import { Logger } from '../utils/logger.js';

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
			await this.harvestService.startTimer('');
		}

		Logger.success('Timer started successfully');
	}
}

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

		const notes = selectedIssues
			.map((issueKey) => issues.find((issue) => issue.value === issueKey)?.name.trim())
			.filter(Boolean)
			.join(', ');

		await this.harvestService.updateTimer(notes);
		Logger.success('Timer notes updated successfully');
	}
}

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
