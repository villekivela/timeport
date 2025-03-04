export function getHarvestHeaders(accessToken: string, accountId?: string): Record<string, string> {
	const headers: Record<string, string> = {
		Authorization: `Bearer ${accessToken}`,
		'User-Agent': 'TimePort (github.com/villekivela/timeport)',
		'Content-Type': 'application/json',
		Accept: 'application/json',
	};

	if (accountId) {
		headers['Harvest-Account-ID'] = accountId;
	}

	return headers;
}
