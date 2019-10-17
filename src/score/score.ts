import { bus } from "../lib/bus";
import {DriverPosition, DriverScore} from './orm'
import { createTracer } from "../lib/tracer";
import { FORMAT_HTTP_HEADERS } from "opentracing";

const tracer = createTracer("score-service");
interface Movement {
    rider_id: number;
    north: number;
    west: number;
    east: number;
    south: number;
}

export async function showPoint(req, res) {
    const httpSpan = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
    const parentSpan = tracer.startSpan("get_point", { childOf: httpSpan })

    const span = tracer.startSpan("parsing_point", { childOf: parentSpan });
    const rider_id = req.params.rider_id;
    console.log('score test: ', rider_id)
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

    // get rider point
    const span2 = tracer.startSpan("read_point_on_db", {
        childOf: parentSpan
      });
    const show = await DriverScore.findOne({
        where: {
            rider_id
        }
    });
    if (!show) {
        span2.setTag("error", true);
        span2.log({
          event: "error",
          message: "point rider tidak ditemukan"
        });
        res.status(404).json({
          ok: false,
          error: "point rider tidak ditemukan"
        });
        span2.finish();
        parentSpan.finish();
        return;
    }
    span2.finish();
    const point = show.get('score')
    
    //encode output
    const span3 = tracer.startSpan("encode_result", {
        childOf: parentSpan
    });
    res.json({
        ok: true,
        point
    })
    span3.finish();
    parentSpan.finish();
}

async function scoreUpdater(movement: Movement) {
    const {north, south, east, west, rider_id} = movement;
    const [scoreRide, created] = await DriverScore.findOrCreate({
        defaults:{
            score: 0,
            distance: 0
        },
        where: {
            rider_id
        }
    });
    let distance = parseFloat(scoreRide.get('distance') as string);
    distance = distance + parseFloat(north.toString()) + parseFloat(south.toString()) + parseFloat(east.toString()) + parseFloat(west.toString());
    console.log('scoreUpdater distance: '+distance);
    let score = parseFloat(scoreRide.get('score') as string);
    score = Math.floor(distance/1000);
    console.log('scoreUpdater score: '+score);
    try{
        await scoreRide.update(
            {
                score,
                distance
            }
        );
    } catch(err){
        console.log(err);
    } 
}

export function scoreProjector(): number {
    return bus.subscribe('rider.moved', (movement: Movement) => {
        console.log('score subcribe');
        scoreUpdater(movement);
    })
}