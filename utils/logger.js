/**
 * Utility class for consistent logging throughout the application
 */
export class Logger {
	/**
	 * Log an error message with optional error details
	 * @param {string} message - The main error message
	 * @param {Error} [error] - Optional Error object with additional details
	 */
	static error(message, error) {
		console.error(`[ERROR] ${message}`, error?.message || '');
	}

	/**
	 * Log an informational message
	 * @param {string} message - The message to log
	 */
	static info(message) {
		console.log(`[INFO] ${message}`);
	}

	/**
	 * Log a success message
	 * @param {string} message - The success message to log
	 */
	static success(message) {
		console.log(`[SUCCESS] ${message}`);
	}
}
