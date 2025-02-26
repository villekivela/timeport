import { TimeTracker } from './timeport.js';

const timeTracker = new TimeTracker();
timeTracker.run().catch(() => process.exit(1));
