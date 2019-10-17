import { Request, Response } from "express";
import { get as httpGet } from "request-promise-native";
import { StatusCodeError } from "request-promise-native/errors";
import { createTracer } from '../lib/tracer';

const tracer = createTracer('track-service');

export async function getRiderReport(req: Request, res: Response) {
  const parentSpan = tracer.startSpan('report');
  const span = tracer.startSpan('parsing_report', { childOf: parentSpan }); // track pake jaeger seberapa lama ini dijalanin

  const rider_id = req.params.rider_id;
  if (!rider_id) {
    res.status(400).json({
      ok: false,
      error: "parameter tidak lengkap"
    });
    return;
  }

  // get rider position
  let position: RiderPosition;
  let logs: RiderLog[] = [];
  try {
    position = await getPosition(rider_id);
    logs = await getMovementLogs(rider_id);

  } catch (err) {
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
    return;
  }

  // encode output
  res.json({
    ok: true,
    position,
    logs
  });
}

const POSITION_PORT = process.env["POSITION_PORT"] || 3001;
const TRACKER_PORT = process.env["TRACKER_PORT"] || 3000;

export interface RiderPosition {
  latitude: number;
  longitude: number;
}

async function getPosition(rider_id: number | string): Promise<RiderPosition> {
  const res = await httpGet(
    `http://localhost:${POSITION_PORT}/position/${rider_id}`,
    {
      json: true
    }
  );

  return {
    latitude: res.latitude,
    longitude: res.longitude
  };
}

export interface RiderLog {
  time: Date;
  east: number;
  west: number;
  north: number;
  south: number;
}

async function getMovementLogs(rider_id: number | string): Promise<RiderLog[]> {
  const res = await httpGet(
    `http://localhost:${TRACKER_PORT}/movement/${rider_id}`,
    {
      json: true
    }
  );

  return res.logs;
}
