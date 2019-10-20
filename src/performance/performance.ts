import { Performance } from "./orm";
import { bus } from "../lib/bus";
import { Request, Response } from "express";
import { createTracer } from "../lib/tracer";
import { FORMAT_HTTP_HEADERS, Tags } from "opentracing";

const tracer = createTracer("performance-service")

interface Movement {
  rider_id: number;
  north: number;
  west: number;
  south: number;
  east: number;
}

export async function getPerformance(req: Request, res: Response) {
  console.log(req.headers);
  const httpSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
  const parentSpan = tracer.startSpan("get_performance", {
    childOf: httpSpan
  })
  const span = tracer.startSpan("parsing_rider", { childOf: parentSpan });
  
  const rider_id = req.params.rider_id
  if (!rider_id) {
    span.setTag("error", true)
    span.log({
      event: "error parsing",
      message: "parameter tidak lengkap"
    })
    res.status(400).json({
      ok: false,
      error: "parameter tidak lengkap"
    });
    span.finish()
    parentSpan.finish()
    return;
  }

  const span2 = tracer.startSpan("read_performance_on_db",{
    childOf: parentSpan
  })

  const performance = await Performance.findOne({
    where: { rider_id }
  });
  if (!performance) {
    span2.setTag("error", true)
    span2.log({
      event: "error",
      message: "rider tidak ditemukan"
    })
    res.status(404).json({
      ok: false,
      error: "rider tidak ditemukan"
    });
    span2.finish()
    parentSpan.finish()
    return;
  }
  const point = performance.get("point");
  span2.finish()

  const span3 = tracer.startSpan("encode_result", {
    childOf:parentSpan
  })
  // encode output
  res.json({
    ok: true, 
    point
  });
  span3.finish()
  parentSpan.finish()
}

async function setPerformance(movement: Movement) {
  const { north, south, east, west, rider_id } = movement;

  const [performance, created] = await Performance.findOrCreate({
    where: { rider_id: rider_id }
  });

  const driverpoint = Math.sqrt(Math.pow((north - south), 2) + Math.pow((west - east), 2));
  let point = parseInt(performance.get("point") as string + driverpoint);

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