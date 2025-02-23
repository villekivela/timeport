import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import { config } from '../config.js';
import { Logger } from '../utils/logger.js';

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
		const command = notes
			? `hrvst start ${config.harvest.projectAlias} --notes "${notes}"`
			: `hrvst start ${config.harvest.projectAlias}`;
		const { stdout } = await exec(command);
		if (notes) {
			console.log(stdout);
		}
	}

	/**
	 * Stop the currently running timer
	 * @param {string} notes - Notes to attach to the timer when stopping
	 * @returns {Promise<void>}
	 * @throws {Error} When the hrvst CLI command fails
	 */
	async stopTimer(notes) {
		if (notes) {
			const { notes: existingNotes } = await this.getRunningTimer();
			const combinedNotes = existingNotes
				? `${existingNotes.trim()}\n${notes.trim()}`
				: notes.trim();
			await exec(`hrvst note --notes "${combinedNotes}" --overwrite`);
		}
		await exec('hrvst stop');
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
	}
}
