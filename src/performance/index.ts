import { startServer } from './server';
import { syncDB } from './orm';
import { connectToBus } from '../lib/bus';
import { performanceUpdater } from './performance';

async function startApp() {
  await syncDB();
  await connectToBus();
  performanceUpdater();
  startServer();
}

startApp();