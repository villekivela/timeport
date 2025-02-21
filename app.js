import { exec } from 'child_process';
import inquirer from 'inquirer';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const JIRA_USERNAME = process.env.JIRA_USERNAME;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const HRVST_PROJECT_ALIAS = process.env.HRVST_PROJECT_ALIAS;

// Check if all required environment variables are set
if (!JIRA_USERNAME || !JIRA_API_TOKEN || !JIRA_BASE_URL || !HRVST_PROJECT_ALIAS) {
	console.error('One or more environment variables are missing.');
	process.exit(1);
}

/**
 * Fetches Jira issues assigned to the current user that are not completed.
 * @async
 * @returns {Promise<Array<{name: string, value: string}>>} Array of Jira issues formatted for inquirer
 * @throws {Error} If the API request fails
 */
async function fetchJiraIssues() {
	const JQL_QUERY = `assignee = currentUser() AND statusCategory != Done AND issuetype != Sub-task`;
	const API_URL = `${JIRA_BASE_URL}/rest/api/3/search?jql=${encodeURIComponent(JQL_QUERY)}`;

	const response = await fetch(API_URL, {
		method: 'GET',
		headers: {
			Authorization: `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_API_TOKEN}`).toString(
				'base64'
			)}`,
			Accept: 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch Jira issues: ${response.statusText}`);
	}

	const data = await response.json();
	return data.issues.map((issue) => ({
		name: `[${issue.key}] ${issue.fields.summary}`,
		value: issue.key,
	}));
}

/**
 * Creates a Harvest time entry with notes from selected Jira issues
 * @async
 * @param {Array<{name: string, value: string}>} issues - All available Jira issues
 * @param {Array<string>} selectedIssues - Array of selected issue keys
 * @returns {Promise<void>}
 */
async function createHarvestEntryWithNotes(issues, selectedIssues) {
	const notes = selectedIssues
		.map((issueKey) => {
			const issue = issues.find((issue) => issue.value === issueKey);
			return issue.name.trim();
		})
		.join(', ')
		.trim();

	return new Promise((resolve, reject) => {
		exec(`hrvst start ${HRVST_PROJECT_ALIAS} --notes "${notes}"`, (error, stdout, stderr) => {
			if (error) {
				reject(new Error(`Error executing hrvst CLI: ${error.message}`));
				return;
			}
			if (stderr) {
				reject(new Error(stderr));
				return;
			}
			console.log(`Notes successfully added: ${stdout}`);
			resolve();
		});
	});
}

/**
 * Stops the currently running Harvest timer
 * @async
 * @returns {Promise<void>}
 */
async function stopHarvestTimer() {
	return new Promise((resolve, reject) => {
		exec('hrvst stop', (error, stdout, stderr) => {
			if (error) {
				reject(new Error(`Error stopping Harvest timer: ${error.message}`));
				return;
			}
			if (stderr) {
				reject(new Error(stderr));
				return;
			}
			console.log('Timer stopped successfully');
			resolve();
		});
	});
}

/**
 * Fetches notes from the currently running Harvest timer
 * @async
 * @returns {Promise<string>}
 */
async function getHarvestTimerNotes() {
	return new Promise((resolve, reject) => {
		exec('hrvst status', (error, stdout, stderr) => {
			if (error) {
				reject(new Error(`Error getting timer notes: ${error.message}`));
				return;
			}
			if (stderr) {
				reject(new Error(stderr));
				return;
			}

			// If no timer is running, return empty string
			if (stdout.includes('No timer running')) {
				resolve('');
				return;
			}

			// Extract notes from the status output
			const notesMatch = stdout.match(/Notes:\s*(.*?)(?:\n|$)/);
			resolve(notesMatch ? notesMatch[1].trim() : '');
		});
	});
}

/**
 * Updates notes for the currently running Harvest timer
 * @async
 * @param {string} newNotes - New notes to append to the timer
 * @returns {Promise<void>}
 */
async function updateHarvestTimerNotes(newNotes) {
	return new Promise((resolve, reject) => {
		exec(`hrvst note -n "${newNotes}"`, (error, stdout, stderr) => {
			if (error) {
				reject(new Error(`Error updating timer notes: ${error.message}`));
				return;
			}
			if (stderr) {
				reject(new Error(stderr));
				return;
			}
			console.log('Timer notes updated successfully');
			resolve();
		});
	});
}

/**
 * Main function to handle Jira and Harvest timer operations
 * @async
 * @returns {Promise<void>}
 */
async function handleJiraToHarvestTimeEntry() {
	try {
		const issues = await fetchJiraIssues();

		const actionAnswer = await inquirer.prompt([
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

		switch (actionAnswer.action) {
			case 'start': {
				const answers = await inquirer.prompt([
					{
						type: 'checkbox',
						name: 'selectedIssues',
						message: 'Select Jira issues:',
						choices: issues,
					},
				]);
				await createHarvestEntryWithNotes(issues, answers.selectedIssues);
				console.log('Selected Jira issues:', answers.selectedIssues);
				break;
			}
			case 'update': {
				const answers = await inquirer.prompt([
					{
						type: 'checkbox',
						name: 'selectedIssues',
						message: 'Select Jira issues for updated notes:',
						choices: issues,
					},
				]);

				// Format each issue on the same line without extra spaces
				const selectedIssue = answers.selectedIssues[0];
				const issue = issues.find((issue) => issue.value === selectedIssue);
				const notes = issue.name.trim();

				await updateHarvestTimerNotes(notes);
				break;
			}
			case 'stop': {
				await stopHarvestTimer();
				break;
			}
		}
	} catch (error) {
		console.error('Error:', error.message);
		process.exit(1);
	}
}

handleJiraToHarvestTimeEntry();
