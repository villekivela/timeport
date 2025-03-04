export interface JiraIssue {
	name: string;
	value: string;
}

export interface JiraApiResponse {
	issues: Array<{
		key: string;
		fields: {
			summary: string;
		};
	}>;
}
