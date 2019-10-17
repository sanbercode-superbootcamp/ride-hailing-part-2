import {startServer} from './server'
import { syncDB } from './orm';
import { connectToBus } from './bus';
import {scoreProjector} from './score'

async function startApp() {
    await syncDB();
    await connectToBus();
    scoreProjector();
    startServer();
}

startApp();