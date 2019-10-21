import * as express from 'express';
import * as cors from 'cors';
import { createServer } from 'http';
import { Server } from 'net';
import { getRiderPerformance } from './performance';
import * as  swaggerUI from "swagger-ui-express";

const swaggerSpec = require("../../swagger/performance.json");

const PORT = process.env['RH_PORT'] || 3003;

const app = express();
app.set('port', PORT);
app.use("/documentations", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use(cors());

// routing
app.get('/point/:rider_id', getRiderPerformance);
app.all("*", (req, res) => res.status(404).send());

const server = createServer(app);

export function startServer(): Server {
  return server.listen(PORT, () => {
    console.log('server listen on port ', PORT);
  });
}