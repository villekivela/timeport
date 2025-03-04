export function getHarvestHeaders(accessToken: string, accountId?: string): Record<string, string> {
	const headers: Record<string, string> = {
		Authorization: `Bearer ${accessToken}`,
		'User-Agent': 'TimePort (https://github.com/villekivela/timeport)',
		'Content-Type': 'application/json',
	};

	if (accountId) {
		headers['Harvest-Account-ID'] = accountId;
	}

	return headers;
}
