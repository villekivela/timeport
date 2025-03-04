import { readFileSync } from 'fs';
import { homedir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import { Config } from './types/index.js';

// NOTE: Configuration management module for the application

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR =
	process.env.NODE_ENV === 'development' ? __dirname : join(homedir(), '.config', 'timeport');
const CONFIG_PATH = join(CONFIG_DIR, 'config.yaml');

// NOTE: Loads configuration from YAML file
function loadConfig(): Config {
	try {
		const configFile = readFileSync(CONFIG_PATH, 'utf8');
		return yaml.parse(configFile);
	} catch (error) {
		throw new Error(
			`Failed to load config from ${CONFIG_PATH}: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}

export const config: Config = loadConfig();

// WARN: Validates required configuration values are present
export const validateConfig = (): void => {
	const { jira } = config;
	const missingVars: string[] = [];

	if (!jira.username) missingVars.push('jira.username');
	if (!jira.apiToken) missingVars.push('jira.apiToken');
	if (!jira.baseUrl) missingVars.push('jira.baseUrl');

	if (missingVars.length > 0) {
		throw new Error(`Missing configuration values: ${missingVars.join(', ')}`);
	}
};
