import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import { config } from '../config.js';

const exec = promisify(execCallback);

/**
 * Service class for interacting with Harvest time tracking
 * through the hrvst CLI commands
 */
export class HarvestService {
	/**
	 * Start a new timer with the specified notes
	 * @param {string} notes - Notes to attach to the timer, typically containing Jira issue references
	 * @returns {Promise<void>}
	 * @throws {Error} When the hrvst CLI command fails
	 */
	async startTimer(notes) {
		const { stdout } = await exec(`hrvst start ${config.harvest.projectAlias} --notes "${notes}"`);
		console.log(`Notes successfully added: ${stdout}`);
	}

	/**
	 * Stop the currently running timer
	 * @returns {Promise<void>}
	 * @throws {Error} When the hrvst CLI command fails
	 */
	async stopTimer() {
		await exec('hrvst stop');
		console.log('Timer stopped successfully');
	}

	/**
	 * Get details about the currently running timer
	 * @returns {Promise<{id: string, notes: string}>} Timer details including ID and notes
	 * @throws {Error} When no running timer is found or the hrvst CLI command fails
	 */
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

	/**
	 * Update the notes of the currently running timer
	 * @param {string} newNotes - New notes to append to the existing timer
	 * @returns {Promise<void>}
	 * @throws {Error} When no running timer is found or the hrvst CLI command fails
	 */
	async updateTimerNotes(newNotes) {
		const { notes: existingNotes } = await this.getRunningTimer();
		const combinedNotes = existingNotes
			? `${existingNotes.trim()}\n${newNotes.trim()}`
			: newNotes.trim();

		await exec(`hrvst note --notes "${combinedNotes}" --overwrite`);
		console.log('Timer notes updated successfully');
	}
}
