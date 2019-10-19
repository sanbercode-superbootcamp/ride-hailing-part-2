import { Request, Response } from "express";
import { get as httpGet } from "request-promise-native";
import { StatusCodeError } from "request-promise-native/errors";
import { createTracer } from "../lib/tracer";
import { Span, FORMAT_HTTP_HEADERS } from "opentracing";

const tracer = createTracer("monitoring-service");
const parentSpan = tracer.startSpan("report");

export async function getRiderReport(req: Request, res: Response) {
  
  const span = tracer.startSpan("parsing_input", { childOf: parentSpan });
  const rider_id = req.params.rider_id;
  if (!rider_id) {
    span.setTag("error", true);
    span.log({
      event: "error parsing",
      message: "parameter tidak lengkap"
    });
    res.status(400).json({
      ok: false,
      error: "parameter tidak lengkap"
    });
    span.finish();
    parentSpan.finish();
    return;
  }

  // get rider position
  let position: RiderPosition;
  const span2 = tracer.startSpan("get_position", {childOf: parentSpan});
  await getPosition(rider_id, span2)
    .then(result => position = result)
    .catch((err) => {
      if (err instanceof StatusCodeError) {
        res.status(err.statusCode).json({
          ok: false,
          error: err.response.body.error
        });
        span2.finish();
        parentSpan.finish();
        return;
      }
      res.status(500).json({
        ok: false,
        error: "gagal melakukan request"
      });
      span2.finish();
      parentSpan.finish();
      return;
    })

  // get rider movement
  let logs: RiderLog[] = [];
  const span3 = tracer.startSpan("get_movement", {childOf: parentSpan});
  getMovementLogs(rider_id, span3)
    .then(result => logs = result)
    .catch((err) => {
      if (err instanceof StatusCodeError) {
        res.status(err.statusCode).json({
          ok: false,
          error: err.response.body.error
        });
        span3.finish();
        parentSpan.finish();
        return;
      }
      res.status(500).json({
        ok: false,
        error: "gagal melakukan request"
      });
      span3.finish();
      parentSpan.finish();
      return;
    })

  // get rider point
  let performance: RiderPerformance;
  const span4 = tracer.startSpan("get_point", {childOf: parentSpan});
  getPerformance(rider_id, span4)
    .then(result => performance = result)
    .catch((err) => {
      if (err instanceof StatusCodeError) {
        res.status(err.statusCode).json({
          ok: false,
          error: err.response.body.error
        });
        span4.finish();
        parentSpan.finish();
        return;
      }
      res.status(500).json({
        ok: false,
        error: "gagal melakukan request"
      });
      span4.finish();
      parentSpan.finish();
      return;
    })

  // encode output
  const span5 = tracer.startSpan("encode_report_result", {
    childOf: parentSpan
  });
  res.json({
    position,
    performance,
    logs
  });
  span5.finish();
  parentSpan.finish();
}

const POSITION_PORT = process.env["POSITION_PORT"] || 3001;
const TRACKER_PORT = process.env["TRACKER_PORT"] || 3000;
const PERFORMANCE_PORT = process.env["PERFORMANCE_PORT"] || 3003;

export interface RiderPosition {
  latitude: number;
  longitude: number;
}
function getPosition(rider_id: number | string, span: Span): Promise<RiderPosition> {
  return new Promise(async(resolve, reject) => {
    try {
      parentSpan.setTag("rider_id", rider_id);

      const url = `http://localhost:${POSITION_PORT}/position/${rider_id}`;
      const headers = {};
      tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
      const res = await httpGet(url, { json: true, headers });

      span.finish();
      resolve({ latitude: res.latitude, longitude: res.longitude });
    } catch (error) {
      span.setTag("error", true);
      span.log({
        event: "error",
        message: error.toString()
      });
      reject(error);
    }
  })
}

export interface RiderPerformance {
  point: number;
}
function getPerformance(rider_id: number | string, span: Span): Promise<RiderPerformance> {
  return new Promise(async(resolve, reject) => {
    try {
      const headers = {};
      const url = `http://localhost:${PERFORMANCE_PORT}/point/${rider_id}`
      tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
      const res = await httpGet(url, { json: true, headers });
      
      span.finish();
      resolve({ point: res.point });
    } catch (error) {
      span.setTag("error", true);
      span.log({
        event: "error",
        message: error.toString()
      });
      reject(error);
    }
  })  
}

export interface RiderLog {
  time: Date;
  east: number;
  west: number;
  north: number;
  south: number;
}
export function getMovementLogs(rider_id: number | string, span: Span): Promise<RiderLog[]> {
  return new Promise(async(resolve, reject) => {
    try {
      parentSpan.setTag("rider_id", rider_id);

      tracer.inject(span, FORMAT_HTTP_HEADERS, {});
      const url = `http://localhost:${TRACKER_PORT}/movement/${rider_id}`;
      const res = await httpGet(url, { json: true });
      
      span.finish();      
      resolve(res.logs);
    } catch (error) {
      span.setTag("error", true);
      span.log({
        event: "error",
        message: error.toString()
      });
      reject(error);
    }
  })
}
