import inquirer from 'inquirer';
import { Logger } from '../utils/logger.js';

export class StartTimerCommand {
	constructor(harvestService) {
		this.harvestService = harvestService;
	}

	async execute(issues) {
		const { selectedIssues } = await inquirer.prompt([
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
		Logger.success('Timer started successfully');
	}
}

export class UpdateTimerCommand {
	constructor(harvestService) {
		this.harvestService = harvestService;
	}

	async execute(issues) {
		const { selectedIssues } = await inquirer.prompt([
			{
				type: 'checkbox',
				name: 'selectedIssues',
				message: 'Select Jira issues for updated notes:',
				choices: issues,
				validate: (input) => (input.length === 1 ? true : 'Please select exactly one issue'),
			},
		]);

		const selectedIssue = selectedIssues[0];
		const issue = issues.find((issue) => issue.value === selectedIssue);

		if (!issue) {
			throw new Error('Selected issue not found');
		}

		await this.harvestService.updateTimerNotes(issue.name.trim());
		Logger.success('Timer notes updated successfully');
	}
}

export class StopTimerCommand {
	constructor(harvestService) {
		this.harvestService = harvestService;
	}

	async execute() {
		await this.harvestService.stopTimer();
		Logger.success('Timer stopped successfully');
	}
}
