import { App } from './app.js';

const timeTracker = new App();
timeTracker.run().catch(() => process.exit(1));
