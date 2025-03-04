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
		accessToken?: string;
		accountId?: string;
		projectId?: string;
		taskId?: string;
	};
}

export interface TimerDetails {
	id: string;
	notes: string;
}

export interface Command {
	execute(issues: JiraIssue[]): Promise<void>;
}

export interface HarvestAuthResponse {
	access_token: string;
	scope: string;
	token_type: string;
}

export interface HarvestAccount {
	id: string;
	name: string;
}

export interface HarvestProject {
	id: string;
	name: string;
}

export interface HarvestTask {
	id: string;
	name: string;
}
