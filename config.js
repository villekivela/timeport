import dotenv from 'dotenv';

dotenv.config();

export const config = {
	jira: {
		username: process.env.JIRA_USERNAME,
		apiToken: process.env.JIRA_API_TOKEN,
		baseUrl: process.env.JIRA_BASE_URL,
	},
	harvest: {
		projectAlias: process.env.HRVST_PROJECT_ALIAS,
	},
};

// Validate config
const validateConfig = () => {
	const { jira, harvest } = config;
	const missingVars = [];

	if (!jira.username) missingVars.push('JIRA_USERNAME');
	if (!jira.apiToken) missingVars.push('JIRA_API_TOKEN');
	if (!jira.baseUrl) missingVars.push('JIRA_BASE_URL');
	if (!harvest.projectAlias) missingVars.push('HRVST_PROJECT_ALIAS');

	if (missingVars.length > 0) {
		throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
	}
};

validateConfig();
