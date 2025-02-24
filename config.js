import dotenv from 'dotenv';
import os from 'os';
import path from 'path';
import fs from 'fs';

// Create config directory if it doesn't exist
const configDir = path.join(os.homedir(), '.config', 'timeport');
if (!fs.existsSync(configDir)) {
	fs.mkdirSync(configDir, { recursive: true });
}

// Load .env from ~/.config/timeport/.env
dotenv.config({ path: path.join(configDir, '.env') });

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
