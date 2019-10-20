import * as express from 'express'
import * as cors from 'cors'
import {createServer} from 'http'
import {json as jsonBodyParser} from 'body-parser'
import { Server } from 'net'
import { showPoint } from './score'
import * as swaggerUI from "swagger-ui-express"

const swaggerSpec = require('../../swagger/score.json');

const PORT = process.env['SCORE_PORT'] || 3003;

const app = express();
app.set('port', PORT)
app.use(cors());
app.use("/documentations", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// routing
app.get('/point/:rider_id', showPoint);

const server = createServer(app);

export function  startServer(): Server {
    return server.listen(PORT, () => {
        console.log('server listen on port ', PORT);
    });
}