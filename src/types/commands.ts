import { JiraIssue } from './jira.js';

export interface Command {
	execute(issues: JiraIssue[]): Promise<void>;
}
