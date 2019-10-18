import * as express from "express";
import * as cors from "cors";
import { createServer } from "http";
import { Server } from "net";
import { getRiderReport } from "./monitor";
import swaggerUiExpress = require("swagger-ui-express");

const swaggerSpec = require('../../swagger/monitor-apiv1.json');

const PORT = process.env["MONITORING_PORT"] || 3002;

const app = express();
app.set("port", PORT);
app.use(cors());

app.use('/apidocs/v1', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpec));

// routing
app.get("/report/:rider_id", getRiderReport);
app.all("*", (req, res) => res.status(404).send());

const server = createServer(app);

export function startServer(): Server {
  return server.listen(PORT, () => {
    console.log("server listen on port ", PORT);
  });
}
