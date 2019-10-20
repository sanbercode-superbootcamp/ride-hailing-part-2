import { bus } from "../lib/bus";
import { Request, Response } from "express";
import { DriverPerformance } from "./orm";
import { FORMAT_HTTP_HEADERS } from "opentracing";
import { createTracer } from "../lib/tracer";

interface Movement {
    rider_id: number;
    north: number;
    west: number;
    east: number;
    south: number;
  }

const tracer = createTracer("performance-service");

export async function performanceUpdater(movement: Movement) {
    const { north, south, east, west, rider_id } = movement;
    console.log('update point')
    const [position, created] = await DriverPerformance.findOrCreate({
        defaults: {
            point: 0
        },
        where: {
            rider_id
        }
    })

    let point = parseFloat(position.get("point") as string);
    let latitude = north - south
    let longitude = west - east
    point = point + Math.round((Math.sqrt(Math.pow(latitude, 2) + Math.pow(longitude, 2)))/1000)
    console.log('point ', point);
    try {
        await position.update({ 
            point
        });
    } catch(err) {
        console.log(err);
    }
};

export async function performanceProjector() {
    return bus.subscribe("rider.moved", (movement: Movement) => {
        console.log('Movement: ',movement)
        performanceUpdater(movement);
    });
};

export async function riderPerformance(req: Request, res: Response) {
    console.log(req.headers);
    const httpSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
    const parentSpan = tracer.startSpan("get_point", {
        childOf: httpSpan
    })
    
    const span = tracer.startSpan("parsing_input_performance", { childOf: parentSpan });
    const rider_id = req.params.rider_id;
    console.log(rider_id)

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

      const span2 = tracer.startSpan("read_performance_on_db", {
        childOf: parentSpan
      });
      const rider = await DriverPerformance.findOne({
        where: { rider_id }
      });
      if (!rider) {
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
      const point = rider.get("point");
      span2.finish();
    
      // encode output
      const span3 = tracer.startSpan("encode_output_performance", {
        childOf: parentSpan
      });
      res.json({
        ok: true,
        point,
      });
      span3.finish();
      parentSpan.finish();
};
    

