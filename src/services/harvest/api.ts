import fetch from 'node-fetch';
import { TimeEntry } from '../../types/index.js';
import { config, getHarvestHeaders } from '../../utils/index.js';

export class HarvestService {
	#baseUrl = 'https://api.harvestapp.com/api/v2';
	#headers: Record<string, string> = {};

	constructor() {
		this.#updateHeaders();
	}

	#updateHeaders(): void {
		this.#headers = getHarvestHeaders(config.harvest.accessToken!, config.harvest.accountId!);
	}

	async startTimer(notes?: string): Promise<void> {
		this.#updateHeaders();
		const response = await fetch(`${this.#baseUrl}/time_entries`, {
			method: 'POST',
			headers: this.#headers,
			body: JSON.stringify({
				project_id: config.harvest.projectId,
				task_id: config.harvest.taskId,
				notes: notes || '',
				spent_date: new Date().toISOString().split('T')[0],
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to start timer: ${response.statusText}`);
		}

		await response.json();
	}

	async updateTimer(notes: string): Promise<void> {
		this.#updateHeaders();
		const activeTimer = await this.#getActiveTimer();
		if (!activeTimer) {
			throw new Error('No active timer found');
		}

		const response = await fetch(`${this.#baseUrl}/time_entries/${activeTimer.id}`, {
			method: 'PATCH',
			headers: this.#headers,
			body: JSON.stringify({
				notes: notes,
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to update timer: ${response.statusText}`);
		}
	}

	async stopTimer(notes?: string): Promise<void> {
		this.#updateHeaders();
		const activeTimer = await this.#getActiveTimer();
		if (!activeTimer) {
			throw new Error('No active timer found');
		}

		if (notes) {
			await this.updateTimer(notes);
		}

		const response = await fetch(`${this.#baseUrl}/time_entries/${activeTimer.id}/stop`, {
			method: 'PATCH',
			headers: this.#headers,
		});

		if (!response.ok) {
			throw new Error(`Failed to stop timer: ${response.statusText}`);
		}
	}

	async #getActiveTimer(): Promise<TimeEntry | null> {
		this.#updateHeaders();
		const today = new Date().toISOString().split('T')[0];
		const response = await fetch(
			`${this.#baseUrl}/time_entries?is_running=true&from=${today}&to=${today}`,
			{
				headers: this.#headers,
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to get active timer: ${response.statusText}`);
		}

		const data = (await response.json()) as { time_entries?: TimeEntry[] };
		return data.time_entries?.[0] || null;
	}
}
