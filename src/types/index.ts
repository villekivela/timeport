export interface JiraIssue {
	name: string;
	value: string;
}

export interface Config {
	jira: {
		username: string;
		apiToken: string;
		baseUrl: string;
	};
	harvest: {
		projectAlias: string;
	};
}

export interface TimerDetails {
	id: string;
	notes: string;
}

export interface Command {
	execute(issues: JiraIssue[]): Promise<void>;
}
