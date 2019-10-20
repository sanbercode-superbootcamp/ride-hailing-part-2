import * as express from 'express';
import * as cors from 'cors';
import { createServer } from 'http';
import { Server } from 'net';
import { getPerformance } from './performance';
import { json as jsonBodyParser } from 'body-parser';
import * as swaggerUI from "swagger-ui-express";

const swaggerSpec = require("../../swagger/performance.json")


const PORT = process.env['RH_PORT'] || 3003;

const app = express();
app.set('port', PORT);
app.use(cors());

app.use("/documentations", swaggerUI.serve, swaggerUI.setup(swaggerSpec))

// routing
app.get('/point/:rider_id', jsonBodyParser(), getPerformance);

const server = createServer(app);

export function startServer(): Server {
  return server.listen(PORT, () => {
    console.log('server listen on port ', PORT);
  });
} 