import { startServer } from './server';
import { syncDB } from './orm';
import { connectToBus } from '../lib/bus';
import { PointPredictor } from "./point";

async function startApp() {
  await syncDB();
  await connectToBus();
  PointPredictor();
  startServer();
}

startApp();
