import { PointGenerator } from "./orm";
import { bus } from "../lib/bus";
import { NatsError } from "nats";

interface Position {
  rider_id: number;
  latitude: number;
  longitude: number;
}

async function pointUpdater(driver_position: Position) {
  const { rider_id, latitude, longitude } = driver_position;
  console.log("update score");
  // update driver position
  const [current_point, created] = await PointGenerator.findOrCreate({
    defaults: {
      score: 0 
    },
    where: {
      rider_id
    }
  });
  // update latitude & longitude
  let point = parseFloat(current_point.get("point") as string);
  point = Math.round(ukurJarak(Math.abs(Number(latitude)), Math.abs(Number(longitude)))*100)/100;

  try {
    await current_point.update({
      point
    });
  } catch (err) {
    console.error(err);
  }
}

export function PointPredictor(): number {
    return bus.subscribe("rider.position", (driver_position : Position) => {
        pointUpdater(driver_position)
    })
}

function ukurJarak(latitude, longitude){
    if(latitude == 0 && longitude == 0){
        return 0
    }else if(latitude == 0){
        return longitude
    }else if(longitude == 0){
        return latitude
    }else{
        return (latitude**2 + longitude**2)**0.5
    }
}