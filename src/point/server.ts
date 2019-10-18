import * as express from 'express';
import * as cors from 'cors';
import { createServer } from 'http';
import { Server } from 'net';
import { getPerformance } from './performance';
import { json as jsonBodyParser } from 'body-parser';

const PORT = process.env['PERFORMANCE_PORT'] || 3003;

const app = express();
app.set('port', PORT);
app.use(cors());

// routing
app.get('/point/:rider_id', jsonBodyParser(), getPerformance);

const server = createServer(app);

export function startServer(): Server {
  return server.listen(PORT, () => {
    console.log('server listen on port ', PORT);
  });
}