import * as express from 'express';
import * as cors from 'cors';
import { createServer } from 'http';
import { Server } from 'net';
import { json as jsonBodyParser } from 'body-parser';
import { getPoint } from './point.service';

const PORT = process.env['POINT_PORT'] || 3003;

const app = express();
app.set('port', PORT);
app.use(cors());

app.get('/point/:rider_id', getPoint);


const server = createServer(app);

export function startServer(): Server {
  return server.listen(PORT, () => {
    console.log('server listen on port ', PORT);
  });
}