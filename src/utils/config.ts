import { readFileSync } from 'fs';
import { homedir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import { Config } from '../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// NOTE: Get the appropriate config directory based on OS and environment
export const getConfigDir = () => {
	if (process.env.NODE_ENV === 'development') {
		return __dirname;
	}

	// NOTE: Use APPDATA for Windows, .config for Unix-like systems
	if (process.platform === 'win32') {
		return join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'timeport');
	}

	return join(homedir(), '.config', 'timeport');
};

const CONFIG_DIR = getConfigDir();
const CONFIG_PATH = join(CONFIG_DIR, 'config.yaml');

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
