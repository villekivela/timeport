import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';
import { Config } from './types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR =
	process.env.NODE_ENV === 'development' ? __dirname : join(homedir(), '.config', 'timeport');

dotenvConfig({ path: join(CONFIG_DIR, '.env') });

export const config: Config = {
	jira: {
		username: process.env.JIRA_USERNAME || '',
		apiToken: process.env.JIRA_API_TOKEN || '',
		baseUrl: process.env.JIRA_BASE_URL || '',
	},
	harvest: {
		projectAlias: process.env.HRVST_PROJECT_ALIAS || '',
	},
};

export const validateConfig = (): void => {
	const { jira, harvest } = config;
	const missingVars: string[] = [];

	if (!jira.username) missingVars.push('JIRA_USERNAME');
	if (!jira.apiToken) missingVars.push('JIRA_API_TOKEN');
	if (!jira.baseUrl) missingVars.push('JIRA_BASE_URL');
	if (!harvest.projectAlias) missingVars.push('HRVST_PROJECT_ALIAS');

	if (missingVars.length > 0) {
		throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
	}
};
