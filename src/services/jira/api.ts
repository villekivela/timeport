import fetch from 'node-fetch';
import { JiraApiResponse, JiraIssue } from '../../types/index.js';
import { config } from '../../utils/index.js';

export class JiraService {
	#baseUrl: string;
	#auth: string;

	constructor() {
		this.#baseUrl = config.jira.baseUrl;
		this.#auth = Buffer.from(`${config.jira.username}:${config.jira.apiToken}`).toString('base64');
	}

	async fetchUserIssues(): Promise<JiraIssue[]> {
		const jql = `assignee = currentUser()
                AND statusCategory != Done
                AND issuetype != Sub-task
                ORDER BY updated DESC`;
		const apiUrl = `${this.#baseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}`;
		const response = await fetch(apiUrl, {
			headers: {
				Authorization: `Basic ${this.#auth}`,
				Accept: 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch Jira issues: ${response.statusText}`);
		}

		const data = (await response.json()) as JiraApiResponse;
		return data.issues.map((issue) => ({
			name: `${issue.key}: ${issue.fields.summary}`,
			value: issue.key,
		}));
	}
}
