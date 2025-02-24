import chalk from 'chalk';

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
		console.error(chalk.red('TimePort ✖ ') + chalk.redBright(message));
		if (error) {
			console.error(chalk.red('  Details:'), chalk.dim(error.message));
		}
	}

	/**
	 * Log an informational message
	 * @param {string} message - The message to log
	 */
	static info(message) {
		console.log(chalk.blue('TimePort ℹ ') + chalk.blueBright(message));
	}

	/**
	 * Log a success message
	 * @param {string} message - The success message to log
	 */
	static success(message) {
		console.log(chalk.green('TimePort ✓ ') + chalk.greenBright(message));
	}

	static warn(message) {
		console.log(chalk.yellow('TimePort ⚠ ') + chalk.yellowBright(message));
	}
}
