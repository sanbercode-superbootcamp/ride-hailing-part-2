import * as express from "express";
import * as cors from "cors";
import * as swaggerUI from "swagger-ui-express";
import { createServer } from "http";
import { Server } from "net";
import { json as jsonBodyParser } from "body-parser";
import { track, getMovementLogs } from "./track";

const swaggerSpec = require('../../swagger/tracker.json');

const PORT = process.env["TRACKER_PORT"] || 3000;

const app = express();
app.set("port", PORT);
app.use(cors());
app.use('/documentations', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// routing
app.post("/track", jsonBodyParser(), track);
app.get("/movement/:rider_id", getMovementLogs);
app.all("*", (req, res) => res.status(404).send());

const server = createServer(app);

export function startServer(): Server {
  return server.listen(PORT, () => {
    console.log("server listen on port ", PORT);
  });
}
