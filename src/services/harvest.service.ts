import fetch from 'node-fetch';
import { config } from '../config.js';
import { getHarvestHeaders } from '../utils/harvest-headers.js';

// NOTE: Interface for parsing Harvest API responses
interface TimeEntry {
	id: string;
	time_entries?: { id: string }[];
}

export class HarvestService {
	private baseUrl = 'https://api.harvestapp.com/api/v2';
	private headers: Record<string, string> = {};

	constructor() {
		this.updateHeaders();
	}

	private updateHeaders(): void {
		this.headers = getHarvestHeaders(config.harvest.accessToken!, config.harvest.accountId!);
	}

	async startTimer(notes?: string): Promise<void> {
		this.updateHeaders();
		const response = await fetch(`${this.baseUrl}/time_entries`, {
			method: 'POST',
			headers: this.headers,
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

		// NOTE: Response data not needed, just ensure request succeeded
		await response.json();
	}

	async updateTimer(notes: string): Promise<void> {
		this.updateHeaders();
		const activeTimer = await this.getActiveTimer();
		if (!activeTimer) {
			throw new Error('No active timer found');
		}

		const response = await fetch(`${this.baseUrl}/time_entries/${activeTimer.id}`, {
			method: 'PATCH',
			headers: this.headers,
			body: JSON.stringify({
				notes: notes,
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to update timer: ${response.statusText}`);
		}
	}

	async stopTimer(notes?: string): Promise<void> {
		this.updateHeaders();
		const activeTimer = await this.getActiveTimer();
		if (!activeTimer) {
			throw new Error('No active timer found');
		}

		if (notes) {
			await this.updateTimer(notes);
		}

		const response = await fetch(`${this.baseUrl}/time_entries/${activeTimer.id}/stop`, {
			method: 'PATCH',
			headers: this.headers,
		});

		if (!response.ok) {
			throw new Error(`Failed to stop timer: ${response.statusText}`);
		}
	}

	private async getActiveTimer(): Promise<{ id: string } | null> {
		this.updateHeaders();
		const today = new Date().toISOString().split('T')[0];
		const response = await fetch(
			`${this.baseUrl}/time_entries?is_running=true&from=${today}&to=${today}`,
			{
				headers: this.headers,
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to get active timer: ${response.statusText}`);
		}

		const data = (await response.json()) as TimeEntry;
		return data.time_entries?.[0] || null;
	}
}
