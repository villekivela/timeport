import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import { config } from '../config.js';

const exec = promisify(execCallback);

export class HarvestService {
	async startTimer(notes: string): Promise<void> {
		const command = notes
			? `hrvst start ${config.harvest.projectAlias} --notes "${notes}"`
			: `hrvst start ${config.harvest.projectAlias}`;

		const { stdout } = await exec(command);
		if (notes) {
			console.log(stdout);
		}
	}

	async updateTimer(notes: string): Promise<void> {
		const command = `hrvst note "${notes}"`;
		await exec(command);
	}

	async stopTimer(notes?: string): Promise<void> {
		const command = notes ? `hrvst stop --notes "${notes}"` : 'hrvst stop';
		await exec(command);
	}
}
