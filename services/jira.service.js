import fetch from 'node-fetch';
import { config } from '../config.js';

/**
 * Service class for interacting with the Jira API
 * Handles authentication and fetching user-specific issues
 */
export class JiraService {
	/**
	 * Initialize the Jira service with authentication details from config
	 */
	constructor() {
		this.baseUrl = config.jira.baseUrl;
		this.auth = Buffer.from(`${config.jira.username}:${config.jira.apiToken}`).toString('base64');
	}

	/**
	 * Fetch all non-completed issues assigned to the current user
	 * @returns {Promise<Array<{name: string, value: string}>>} Array of issues formatted for inquirer choices
	 * @throws {Error} When the API request fails or returns an error status
	 */
	async fetchUserIssues() {
		const JQL_QUERY = `assignee = currentUser() AND statusCategory != Done AND issuetype != Sub-task`;
		const API_URL = `${this.baseUrl}/rest/api/3/search?jql=${encodeURIComponent(JQL_QUERY)}`;

		const response = await fetch(API_URL, {
			method: 'GET',
			headers: {
				Authorization: `Basic ${this.auth}`,
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
}
