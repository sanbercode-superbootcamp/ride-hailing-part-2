import { Request, Response } from "express";
import { PointGenerator } from "./orm";
import { createTracer } from "../lib/tracer";
import { FORMAT_HTTP_HEADERS, Tags } from "opentracing";

const tracer = createTracer("point-service");

export async function getPoint(req: Request, res: Response) {
  console.log(req.headers);
  const httpSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
  const parentSpan = tracer.startSpan("get_position", {
    childOf: httpSpan
  })

  const span = tracer.startSpan("parsing_rider", { childOf: parentSpan });
  // parsing input
  let id = req.params;
  console.log(id)
  if (!id) {
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

  // get rider point
  const span2 = tracer.startSpan("read_point_on_db", {
    childOf: parentSpan
  });

  const result = await PointGenerator.findOne({
    where : {rider_id : Number(id.rider_id)},
    attributes : ['point']
  });
  if (!result) {
    span2.setTag("error", true);
    span2.log({
      event: "error",
      message: "rider tidak ditemukan"
    });
    res.status(404).json({
      ok: false,
      error: "rider tidak ditemukan"
    });
    span2.finish();
    parentSpan.finish();
    return;
  }
  span2.finish();

  // encode output
  const span3 = tracer.startSpan("encode_result", {
    childOf: parentSpan
  });
  const point = result.get("point");
  console.log(point)

  res.json({
    ok : true,
    point : point
  })
  span3.finish();
  parentSpan.finish();
  
}
