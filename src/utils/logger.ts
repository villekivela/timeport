import chalk from 'chalk';

export class Logger {
	static error(message: string, error?: Error): void {
		console.error(chalk.red('TimePort ✖ ') + chalk.redBright(message));
		if (error) {
			console.error(chalk.red('  Details:'), chalk.dim(error.message));
		}
	}

	static info(message: string): void {
		console.log(chalk.blue('TimePort ℹ ') + chalk.blueBright(message));
	}

	static success(message: string): void {
		console.log(chalk.green('TimePort ✓ ') + chalk.greenBright(message));
	}

	static warn(message: string): void {
		console.log(chalk.yellow('TimePort ⚠ ') + chalk.yellowBright(message));
	}
}
