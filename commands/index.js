import inquirer from 'inquirer';
import { Logger } from '../utils/logger.js';

/**
 * Command to start a new timer with selected Jira issues
 */
export class StartTimerCommand {
	/**
	 * @param {import('../services/harvest.service.js').HarvestService} harvestService - The Harvest service instance
	 */
	constructor(harvestService) {
		this.harvestService = harvestService;
	}

	/**
	 * Execute the start timer command
	 * @param {Array<{name: string, value: string}>} issues - List of available Jira issues
	 * @returns {Promise<void>}
	 */
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

/**
 * Command to update notes on the currently running timer
 */
export class UpdateTimerCommand {
	/**
	 * @param {import('../services/harvest.service.js').HarvestService} harvestService - The Harvest service instance
	 */
	constructor(harvestService) {
		this.harvestService = harvestService;
	}

	/**
	 * Execute the update timer command
	 * @param {Array<{name: string, value: string}>} issues - List of available Jira issues
	 * @returns {Promise<void>}
	 * @throws {Error} When no issue is selected or issue is not found
	 */
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

/**
 * Command to stop the currently running timer
 */
export class StopTimerCommand {
	/**
	 * @param {import('../services/harvest.service.js').HarvestService} harvestService - The Harvest service instance
	 */
	constructor(harvestService) {
		this.harvestService = harvestService;
	}

	/**
	 * Execute the stop timer command
	 * @param {Array<{name: string, value: string}>} issues - List of available Jira issues
	 * @returns {Promise<void>}
	 */
	async execute(issues) {
		const { addNotes } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'addNotes',
				message: 'Would you like to add final Jira issues before stopping?',
				default: false,
			},
		]);

		if (addNotes) {
			const { selectedIssues } = await inquirer.prompt([
				{
					type: 'checkbox',
					name: 'selectedIssues',
					message: 'Select Jira issues for final notes:',
					choices: issues,
					validate: (input) => (input.length > 0 ? true : 'Please select at least one issue'),
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
