import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import { config } from '../config.js';

const exec = promisify(execCallback);

export class HarvestService {
	async startTimer(notes) {
		const { stdout } = await exec(`hrvst start ${config.harvest.projectAlias} --notes "${notes}"`);
		console.log(`Notes successfully added: ${stdout}`);
	}

	async stopTimer() {
		await exec('hrvst stop');
		console.log('Timer stopped successfully');
	}

	async getRunningTimer() {
		const { stdout: entriesJson } = await exec(
			'hrvst time-entries list --is_running=true --output=json'
		);

		const entries = JSON.parse(entriesJson);
		if (!entries?.length) {
			throw new Error('No running timer found');
		}

		const entryId = entries[0].id;
		const { stdout: detailJson } = await exec(
			`hrvst time-entries get --time_entry_id=${entryId} --output=json`
		);

		const entryDetails = JSON.parse(detailJson);
		return { id: entryId, notes: entryDetails.notes || '' };
	}

	async updateTimerNotes(newNotes) {
		const { notes: existingNotes } = await this.getRunningTimer();
		const combinedNotes = existingNotes
			? `${existingNotes.trim()}\n${newNotes.trim()}`
			: newNotes.trim();

		await exec(`hrvst note --notes "${combinedNotes}" --overwrite`);
		console.log('Timer notes updated successfully');
	}
}
