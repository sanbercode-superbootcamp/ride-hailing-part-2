import {startServer} from './server'
import { syncDB } from './orm';
import { connectToBus } from '../lib/bus';
import {scoreProjector} from './score'

async function startApp() {
    await syncDB();
    await connectToBus();
    scoreProjector();
    startServer();
}

startApp();