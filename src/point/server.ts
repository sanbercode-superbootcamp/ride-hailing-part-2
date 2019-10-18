import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'net';
import { getPoint } from './score';
import swaggerUiExpress = require('swagger-ui-express');

const swaggerSpec = require('../../swagger/point-apiv1.json');

const PORT = process.env['POINT_PORT'] || 3003;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/apidocs/v1', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpec));

app.get('/point/:rider_id', getPoint);
app.all("*", (req, res) => res.status(404).send());

const server = createServer(app);

export function startServer(): Server {
    return server.listen(PORT, () => {
        console.log("Server listen on ", PORT);
    })
}