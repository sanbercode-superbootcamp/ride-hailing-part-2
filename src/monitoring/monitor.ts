import { Request, Response } from "express";
import { get as httpGet } from "request-promise-native";
import { StatusCodeError } from "request-promise-native/errors";
import { createTracer } from "../lib/tracer";
import { Span, FORMAT_HTTP_HEADERS, Tags } from "opentracing";
import { reject } from "bluebird";

const tracer = createTracer("monitoring-service");

export async function getRiderReport(req: Request, res: Response) {
  const parentSpan = tracer.startSpan("report");
  const span = tracer.startSpan("parsing_report", { childOf: parentSpan });
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
  let logs: RiderLog[] = [];
  let point: RiderPoint;

  const span2 = tracer.startSpan("report_get_position", {
    childOf: parentSpan
  });
  const span3 = tracer.startSpan("report_get_movement", {
    childOf: parentSpan
  });
  const span4 = tracer.startSpan("report_get_point", {
    childOf: parentSpan
  });

  const promiseArr = [
    getPosition(rider_id, span2, parentSpan)
      .then((dataPos) => {
        position = dataPos
      })
      .catch((err) => {
        console.log("MASUK ERROR1")
        throw new Error(err);
      }),
    getMovementLogs(rider_id, span3, parentSpan)
      .then(dataMove => logs = dataMove)
      .catch((err) => {
        console.log("MASUK ERROR2")
        throw new Error(err);
      }),
    getPoint(rider_id, span4, parentSpan)
      .then(dataPoint => point = dataPoint)
      .catch((err) => {
        console.log("MASUK ERROR3")
        throw new Error(err);
      }),
  ];

  await Promise.all(promiseArr.map((val, idx) => {
    return val.catch((err) => {
      throw new Error(err);
    })
  })).then(() => {
    // encode output
    const span5 = tracer.startSpan("encode_report_result", {
      childOf: parentSpan
    });
    res.json({
      ok: true,
      position,
      logs,
      point
    });
    span5.finish();
    parentSpan.finish();
  }).catch((err) => {
    parentSpan.finish();
    console.log("KE REJECT");
    if (err instanceof StatusCodeError) {
      res.status(err.statusCode).json({
        ok: false,
        error: err.response.body.error
      });
      return;
    }
    res.status(500).json({
      ok: false,
      error: "gagal melakukan request"
    });
  })
}

const POSITION_PORT = process.env["POSITION_PORT"] || 3001;
const TRACKER_PORT = process.env["TRACKER_PORT"] || 3000;
const POINT_PORT = process.env["POINT_PORT"] || 3003;

export interface RiderPosition {
  latitude: number;
  longitude: number;
}

function getPosition(rider_id: number | string, span: Span, parentSpan: Span): Promise<RiderPosition> {
  return new Promise(async (resolve, reject) => {
    let position: RiderPosition;
    try {
      parentSpan.setTag("rider_id", rider_id);
      const url = `http://localhost:${POSITION_PORT}/position/${rider_id}`;

      const headers = {};
      tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
      const res = await httpGet(url, {
        json: true,
        headers
      });

      position = {
        latitude: res.latitude,
        longitude: res.longitude
      };

      span.finish();
      resolve(position);
    } catch (err) {
      span.setTag("error", true);
      span.log({
        event: "error",
        message: err.toString()
      });
      span.finish();
      reject(err);
    }

  });
}

export interface RiderLog {
  time: Date;
  east: number;
  west: number;
  north: number;
  south: number;
}

function getMovementLogs(rider_id: number | string, span: Span, parentSpan: Span): Promise<RiderLog[]> {
  return new Promise(async (resolve, reject) => {
    let logs: RiderLog[];
    try {
      const headers = {}
      tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
      const res = await httpGet(
        `http://localhost:${TRACKER_PORT}/movement/${rider_id}`,
        {
          json: true,
          headers
        }
      );

      logs = res.logs;
      span.finish();
      resolve(logs);
    } catch (err) {
      span.setTag("error", true);
      span.log({
        event: "error",
        message: err.toString()
      });

      span.finish();
      reject();
    }
  });

}

export interface RiderPoint {
  point: number;
}

function getPoint(rider_id: number | string, span: Span, parentSpan: Span): Promise<RiderPoint> {
  return new Promise(async (resolve, reject) => {
    try {
      const headers = {}
      tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
      const res = await httpGet(
        `http://localhost:${POINT_PORT}/point/${rider_id}`,
        {
          json: true,
          headers
        }
      );

      span.finish();
      resolve(res.point);
    } catch (err) {
      span.setTag("error", true);
      span.log({
        event: "error",
        message: err.toString()
      });
      span.finish();
      reject()
    }
  });
}
