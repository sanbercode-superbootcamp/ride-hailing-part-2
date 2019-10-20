import { Request, Response } from "express";
import { get as httpGet } from "request-promise-native";
import { StatusCodeError } from "request-promise-native/errors";
import { createTracer } from "../lib/tracer";
import { Span, FORMAT_HTTP_HEADERS, Tags } from "opentracing";

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
  span.finish();

  // get rider position
  let position: RiderPosition;
  let logs: RiderLog[] = [];
  let point: scoreRider;
  parentSpan.setTag("rider_id", rider_id);
  // try {
  //   position = await getPosition(rider_id, span2);
  //   span2.finish();
  // } catch (err) {
  //   span2.setTag("error", true);
  //   span2.log({
  //     event: "error",
  //     message: err.toString()
  //   });
  //   if (err instanceof StatusCodeError) {
  //     res.status(err.statusCode).json({
  //       ok: false,
  //       error: err.response.body.error
  //     });
  //     span2.finish();
  //     parentSpan.finish();
  //     return;
  //   }
  //   res.status(500).json({
  //     ok: false,
  //     error: "gagal melakukan request"
  //   });
  //   span2.finish();
  //   parentSpan.finish();
  //   return;
  // }

  // const span3 = tracer.startSpan("report_get_movement", {
  //   childOf: parentSpan
  // });
  // try {
  //   logs = await getMovementLogs(rider_id, span3);
  //   span3.finish();
  // } catch (err) {
  //   span3.setTag("error", true);
  //   span3.log({
  //     event: "error",
  //     message: err.toString()
  //   });
  //   if (err instanceof StatusCodeError) {
  //     res.status(err.statusCode).json({
  //       ok: false,
  //       error: err.response.body.error
  //     });
  //     span3.finish();
  //     parentSpan.finish();
  //     return;
  //   }
  //   res.status(500).json({
  //     ok: false,
  //     error: "gagal melakukan request"
  //   });
  //   span3.finish();
  //   parentSpan.finish();
  //   return;
  // }

  // const span5 = tracer.startSpan("report_get_point", {
  //   childOf: parentSpan
  // });
  // try {
  //   point = await getScore(rider_id, span5);
  //   span5.finish();
  // } catch (err) {
  //   span5.setTag("error", true);
  //   span5.log({
  //     event: "error",
  //     message: err.toString()
  //   });
  //   if (err instanceof StatusCodeError) {
  //     res.status(err.statusCode).json({
  //       ok: false,
  //       error: err.response.body.error
  //     });
  //     span5.finish();
  //     parentSpan.finish();
  //     return;
  //   }
  //   res.status(500).json({
  //     ok: false,
  //     error: "gagal melakukan request"
  //   });
  //   span5.finish();
  //   parentSpan.finish();
  //   return;
  // }

  //promise all
  const spanPromiseAll = tracer.startSpan("execute promise all", {
    childOf: parentSpan
  });
  const span2 = tracer.startSpan("report_get_position", {
    childOf: spanPromiseAll
  });
  const span3 = tracer.startSpan("report_get_movement", {
    childOf: spanPromiseAll
  });
  const span5 = tracer.startSpan("report_get_point", {
    childOf: spanPromiseAll
  });
  try {
    [position, logs, point] = await Promise.all([getPosition(rider_id, span2), getMovementLogs(rider_id, span3), getScore(rider_id, span5)]);
    spanPromiseAll.finish();
  } catch (err) {
    spanPromiseAll.setTag("error", true);
    spanPromiseAll.log({
      event: "error",
      message: err.toString()
    });
    if (err instanceof StatusCodeError) {
      res.status(err.statusCode).json({
        ok: false,
        error: err.response.body.error
      });
      spanPromiseAll.finish();
      parentSpan.finish();
      return;
    }
    res.status(500).json({
      ok: false,
      error: "gagal melakukan request"
    });
    spanPromiseAll.finish();
    parentSpan.finish();
    return;
  }

  if(position){
    span2.finish();
  } else{
    span2.setTag("Error", true);
    span2.finish();
    parentSpan.finish();
    return;
  }

  if(logs){
    span3.finish();
  } else{
    span3.setTag("Error", true);
    span3.finish();
    parentSpan.finish();
    return;
  }

  if(point){
    span5.finish();
  } else{
    span5.setTag("Error", true);
    span5.finish();
    parentSpan.finish();
    return;
  }

  // encode output
  const span4 = tracer.startSpan("encode_report_result", {
    childOf: parentSpan
  });
  res.json({
    ok: true,
    position,
    logs,
    point
  });
  span4.finish();
  parentSpan.finish();
}

const POSITION_PORT = process.env["POSITION_PORT"] || 3001;
const TRACKER_PORT = process.env["TRACKER_PORT"] || 3000;
const SCORE_PORT = process.env["SCORE_PORT"] || 3003;

export interface RiderPosition {
  latitude: number;
  longitude: number;
}

export async function getPosition(
  rider_id: number | string,
  span: Span
): Promise<RiderPosition> {
  const url = `http://localhost:${POSITION_PORT}/position/${rider_id}`;

  const headers = {};
  tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
  const res = await httpGet(url, {
    json: true,
    headers
  });

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

export async function getMovementLogs(
  rider_id: number | string,
  span: Span
): Promise<RiderLog[]> {
  const url = `http://localhost:${TRACKER_PORT}/movement/${rider_id}`

  const headers = {};
  tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
  const res = await httpGet(
    url,
    {
      json: true,
      headers
    }
  );

  return res;
}

export interface scoreRider {
  points: number;
}

export async function getScore(
  rider_id: number | string,
  span: Span
): Promise<scoreRider> {
  const url = `http://localhost:${SCORE_PORT}/point/${rider_id}`

  const headers = {};
  tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
  const res = await httpGet(
    url,
    {
      json: true,
      headers
    }
  );

  return res;
}
