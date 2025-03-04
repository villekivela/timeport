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
