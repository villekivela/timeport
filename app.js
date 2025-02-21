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
 * @param {Array<string>} selectedIssueKeys - Array of selected issue keys
 * @returns {Promise<void>}
 */
async function createHarvestEntryWithNotes(issues, selectedIssueKeys) {
	const notes = selectedIssueKeys
		.map((issueKey) => {
			const issue = issues.find((issue) => issue.value === issueKey);
			return issue.name;
		})
		.join('\n');

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
			console.log(`Notes successfully added: \n${stdout}`);
			resolve();
		});
	});
}

/**
 * Main function to handle Jira issue selection and create corresponding Harvest time entry
 * @async
 * @returns {Promise<void>}
 */
async function handleJiraToHarvestTimeEntry() {
	try {
		const issues = await fetchJiraIssues();

		const answers = await inquirer.prompt([
			{
				type: 'checkbox',
				name: 'selectedIssues',
				message: 'Select Jira issues:',
				choices: issues,
			},
		]);

		await createHarvestEntryWithNotes(issues, answers.selectedIssues);
	} catch (error) {
		console.error('Error:', error.message);
		process.exit(1);
	}
}

handleJiraToHarvestTimeEntry();
