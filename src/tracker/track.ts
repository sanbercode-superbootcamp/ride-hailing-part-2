import { Request, Response } from "express";
import { TrackEvent } from "./orm";
import { bus } from "../lib/bus";
import { createTracer } from "../lib/tracer";
import { FORMAT_HTTP_HEADERS } from "opentracing";

const tracer = createTracer("track-service");

export async function track(req: Request, res: Response) {
  const parentSpan = tracer.startSpan("track");
  const span = tracer.startSpan("parsing_track", { childOf: parentSpan });
  // parsing input
  const param = req.body;
  console.log(param);
  if (param.rider_id === undefined || param.north === undefined || param.west === undefined || param.east === undefined || param.south === undefined) {
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

  const rider_id = param.rider_id;
  const north = parseFloat(param.north);
  const west = parseFloat(param.west);
  const east = parseFloat(param.east);
  const south = parseFloat(param.south);
  span.finish();

  const span2 = tracer.startSpan("save_track", { childOf: parentSpan });
  span.setTag("rider_id", rider_id);

  // save tracking movement
  const track = new TrackEvent({
    rider_id,
    north,
    west,
    east,
    south
  });
  try {
    await track.save();
  } catch (err) {
    span2.setTag("error", true);
    span2.log({
      event: "error parsing",
      message: err.toString()
    });
    console.error(err);
    res.status(500).json({
      ok: false,
      message: "gagal menyimpan data"
    });
    span2.finish();
    parentSpan.finish();
    return;
  }
  span2.finish();

  const span3 = tracer.startSpan("publish_track_event", {
    childOf: parentSpan
  });
  bus.publish("rider.moved", {
    rider_id,
    north,
    west,
    east,
    south
  });
  span3.finish();

  // encode output
  const span4 = tracer.startSpan("encode_track_result", {
    childOf: parentSpan
  });
  res.json({
    ok: true
  });
  span4.finish();
  parentSpan.finish();
}

export async function getMovementLogs(req: Request, res: Response) {
  const httpSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
  const parentSpan = tracer.startSpan("get_movement_logs", { childOf: httpSpan });

  const span = tracer.startSpan("parse_input", { childOf: parentSpan });
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
  span.finish();

  const span2 = tracer.startSpan("read_database", { childOf: parentSpan });
  // get rider movement logs
  let events = [];
  try {
    events = await TrackEvent.findAll({
      where: { rider_id },
      raw: true
    });
  } catch (err) {
    console.error(err);
    span2.setTag("error", true);
    span2.log({
      event: "error parsing",
      message: "error read db"
    });
    res.status(500).json({
      ok: false,
      message: "gagal menyimpan data"
    });
    span2.finish();
    parentSpan.finish();
    return;
  }
  span2.finish();

  const span3 = tracer.startSpan("encode_output", { childOf: parentSpan });
  // encode output
  res.json({
    ok: true,
    logs: events.map((e: any) => ({
      time: e.createdAt,
      east: e.east,
      west: e.west,
      north: e.north,
      south: e.south
    }))
  });
  span3.finish();
  parentSpan.finish();
}
