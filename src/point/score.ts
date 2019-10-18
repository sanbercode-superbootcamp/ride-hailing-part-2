import { DriverPerformance } from "./orm";
import { bus } from "./bus";
import { Request, Response } from "express";
import { createTracer } from '../lib/tracer';
import { FORMAT_HTTP_HEADERS } from "opentracing";

const tracer = createTracer("point-service");

// update driver position lat lng

interface Movement {
    rider_id: number,
    north: number,
    east: number,
    south: number,
    west: number
}

export async function getPoint(req: Request, res: Response) {
    const httpSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
    const parentSpan = tracer.startSpan("get_point", { childOf: httpSpan });

    const span = tracer.startSpan("parse_input", { childOf: parentSpan });
    const rider_id = req.params.rider_id;
    if (!rider_id) {
        span.setTag("error", true);
        span.log({
            event: "error parsing",
            message: "parameter tidak lengkap"
        });
        res.sendStatus(400);
        span.finish();
        parentSpan.finish();
        return;
    }
    span.finish();

    const span2 = tracer.startSpan("read_database", { childOf: parentSpan });
    const point = await
        DriverPerformance.findOne({
            where: {
                rider_id: rider_id
            },
            attributes: ['point']
        })

    if (!point) {
        span2.setTag("error", true);
        span2.log({
            event: "error parsing",
            message: "rider tidak ditemukan"
        });
        res.statusCode = 400;
        res.json({
            status: false, message: `No \`rider_id\` of ${rider_id} was found `
        });
        span2.finish();
        parentSpan.finish();
        return;
    }
    span2.finish();

    const span3 = tracer.startSpan("encode_output", { childOf: parentSpan });
    res.json({ oke: true, point: point['point'] });
    span3.finish();
    parentSpan.finish();

}

async function performanceUpdater(movement: Movement) {
    const moveData: Movement = movement;

    const [current_status, created] = await
        DriverPerformance.findOrCreate({
            defaults: {
                total_distance: 0,
                point: 0
            },
            where: {
                rider_id: moveData.rider_id
            }
        })

    let new_distance = parseInt(moveData.east.toString()) + parseInt(moveData.north.toString()) + parseInt(moveData.south.toString()) + parseInt(moveData.west.toString());

    let total_distance = parseFloat(current_status.get('total_distance') as string);
    total_distance += new_distance;
    let point = Math.floor(total_distance / 1000);
    try {
        await current_status.update({
            total_distance: total_distance,
            point: point
        })
    } catch (err) {
        console.error(err);
    }
}

export function performanceProjector() {
    bus.subscribe('rider.moved', (data) => {
        console.log("BUS: RIDER MOVED");
        performanceUpdater(data)
    })
}
