export interface TimeEntry {
	id: number; // Unique ID for the time entry
	spent_date: string; // Date of the time entry
	user: {
		id: number; // ID of the user associated with the time entry
		name: string; // Name of the user associated with the time entry
	};
	client: {
		id: number; // ID of the associated client
		name: string; // Name of the associated client
	};
	project: {
		id: number; // ID of the associated project
		name: string; // Name of the associated project
	};
	task: {
		id: number; // ID of the associated task
		name: string; // Name of the associated task
	};
	hours: number; // Number of hours tracked in this time entry
	notes: string; // Notes attached to the time entry
	is_locked: boolean; // Whether the time entry has been locked
	locked_reason?: string; // Reason for locking the time entry
	is_closed: boolean; // Whether the time entry has been approved
	is_billed: boolean; // Whether the time entry has been marked as invoiced
	timer_started_at?: string; // Date and time the running timer was started
	started_time?: string; // Time the time entry was started
	ended_time?: string; // Time the time entry was ended
	is_running: boolean; // Whether the time entry is currently running
	created_at: string; // Date and time the time entry was created
	updated_at: string; // Date and time the time entry was last updated
	billable: boolean; // Whether the time entry is billable
	budgeted: boolean; // Whether the time entry counts towards the project budget
	billable_rate?: number; // The billable rate for the time entry
	cost_rate?: number; // The cost rate for the time entry
}

export interface ProjectAssignment {
	id: number;
	name: string;
}

export interface TaskAssignment {
	id: number;
	name: string;
}

export interface HarvestAuthResponse {
	access_token: string;
	scope: string;
	token_type: string;
}

export interface HarvestAccount {
	id: string;
	name: string;
}
