import { Request, Response } from "express";
import { Performance } from "./orm";
import { bus } from "../lib/bus";
import { createTracer } from "../lib/tracer";
import { FORMAT_HTTP_HEADERS, Tags } from "opentracing";

const tracer = createTracer('performance-service');

interface Movement {
  rider_id: number;
  north: number;
  west: number;
  south: number;
  east: number;
}

export async function getPerformance(req: Request, res: Response) {
  // parsing input
  const httpSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
  const parentSpan = tracer.startSpan("get_point", {
    childOf: httpSpan
  });
  const span = tracer.startSpan("parsing_input", { childOf: parentSpan });
  const rider_id = req.params.rider_id
  if (!rider_id) {
    res.status(400).json({
      ok: false,
      error: "parameter tidak lengkap"
    });
    span.finish();
    parentSpan.finish();
    return;
  }

  const span2 = tracer.startSpan("read_database ", {
    childOf: parentSpan
  });
  const performance = await Performance.findOne({
    where: { rider_id }
  });
  if (!performance) {
    res.status(404).json({
      ok: false,
      error: "rider tidak ditemukan"
    });
    span2.finish();
    parentSpan.finish();
    return;
  }
  const point = performance.get("point");
  span2.finish();

  // encode output
  const span3 = tracer.startSpan("encode_output", {
    childOf: parentSpan
  });
  res.json({
    ok: true, point
  });
  span3.finish();
  parentSpan.finish();
}

async function setPerformance(movement: Movement) {
  const { north, south, east, west, rider_id } = movement;
  console.log("calculate point");

  const [performance, created] = await Performance.findOrCreate({
    where: { rider_id: rider_id }
  });

  const displacement = Math.sqrt(Math.pow((north - south), 2) + Math.pow((west - east), 2));
  let point = parseFloat(performance.get("point") as string + displacement);

  console.log('displacement ', typeof(displacement));

  console.log(point);

  try {
    await performance.update({
      point: point
    });
  } catch (error) {
    console.log(error); 
  }  
}

export function performanceUpdater(): number {
  return bus.subscribe("rider.moved", (movement: Movement) => {
    setPerformance(movement);
  });
}
