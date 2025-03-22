import { JiraIssue } from '../types/jira.js';

export function generateNotes(selectedIssues: string[], issues: JiraIssue[]): string {
	return selectedIssues
		.map((issueKey) => issues.find((issue) => issue.value === issueKey)?.name.trim())
		.filter(Boolean)
		.join('\n'); // INFO: Use new line to separate notes
}

