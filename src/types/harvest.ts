export interface TimeEntry {
	id: string;
	notes?: string;
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
