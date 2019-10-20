import { startServer } from './server';
import { syncDB } from './orm';
import { connectToBus } from '../lib/bus';
import { performanceProjector } from './performance';

async function startApp() {
  await syncDB();
  await connectToBus();
  performanceProjector();
  startServer();
}

startApp();