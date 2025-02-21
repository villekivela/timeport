export class Logger {
	static error(message, error) {
		console.error(`[ERROR] ${message}`, error?.message || '');
	}

	static info(message) {
		console.log(`[INFO] ${message}`);
	}

	static success(message) {
		console.log(`[SUCCESS] ${message}`);
	}
}
