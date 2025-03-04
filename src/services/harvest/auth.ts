import inquirer from 'inquirer';
import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { stringify } from 'yaml';
import { ProjectAssignment, TaskAssignment } from '../../types/index.js';
import { config, getHarvestHeaders, Logger } from '../../utils/index.js';

export class HarvestAuthService {
	async authenticate(): Promise<void> {
		if (config.harvest.accessToken && config.harvest.accountId) {
			return;
		}

		Logger.info('Starting Harvest authentication...');

		const { accessToken } = await inquirer.prompt({
			type: 'input',
			name: 'accessToken',
			message: 'Enter your Harvest personal access token:',
			validate: (input) => (input ? true : 'Access token is required'),
		});

		const accountsResponse = await fetch('https://id.getharvest.com/api/v2/accounts', {
			headers: getHarvestHeaders(accessToken),
		});
		if (!accountsResponse.ok) {
			throw new Error('Failed to authenticate with Harvest');
		}

		const accountsData = await accountsResponse.json();
		if (!accountsData.accounts?.length) {
			throw new Error('No Harvest accounts found');
		}
		const accountId = accountsData.accounts[0].id;

		config.harvest.accessToken = accessToken;
		config.harvest.accountId = accountId;

		await this.#setupProjectAndTask(accessToken, accountId);
		await this.#saveConfig();
		Logger.success('Harvest authentication completed successfully');
	}

	async #setupProjectAndTask(accessToken: string, accountId: string): Promise<void> {
		const projectsResponse = await fetch(
			'https://api.harvestapp.com/api/v2/users/me/project_assignments',
			{ headers: getHarvestHeaders(accessToken, accountId) }
		);
		if (!projectsResponse.ok) {
			const error = await projectsResponse.text();
			throw new Error(`Failed to fetch projects: ${error}`);
		}

		const projects = await projectsResponse.json();
		const uniqueProjects = projects.project_assignments.map((assignment: any) => ({
			id: assignment.project.id,
			name: assignment.project.name,
		}));

		if (uniqueProjects.length === 0) {
			throw new Error('No projects found');
		}

		const { projectId } = await inquirer.prompt({
			type: 'list',
			name: 'projectId',
			message: 'Select a project:',
			choices: uniqueProjects.map((p: ProjectAssignment) => ({ name: p.name, value: p.id })),
		});
		config.harvest.projectId = projectId;

		const selectedAssignment = projects.project_assignments.find(
			(a: any) => a.project.id === projectId
		);
		const uniqueTasks = selectedAssignment.task_assignments.map((task: any) => ({
			id: task.task.id,
			name: task.task.name,
		}));

		if (uniqueTasks.length === 0) {
			throw new Error('No tasks found for selected project');
		}

		const { taskId } = await inquirer.prompt({
			type: 'list',
			name: 'taskId',
			message: 'Select a task:',
			choices: uniqueTasks.map((t: TaskAssignment) => ({ name: t.name, value: t.id })),
		});
		config.harvest.taskId = taskId;
	}

	async #saveConfig(): Promise<void> {
		try {
			const configDir = join(homedir(), '.config', 'timeport');
			const configPath = join(configDir, 'config.yaml');

			await mkdir(configDir, { recursive: true });
			const yamlContent = stringify(config);
			await writeFile(configPath, yamlContent, 'utf8');

			Logger.info('Configuration saved successfully');
		} catch (error) {
			throw new Error(
				`Failed to save configuration: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}
}
