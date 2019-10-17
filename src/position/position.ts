import { DriverPosition } from "./orm";
import { bus } from "../lib/bus";
import { Request, Response } from "express";

interface Movement {
  rider_id: number;
  north: string;
  west: string;
  east: string;
  south: string;
}

async function positionUpdater(event: Movement) {
  const rider_id = event.rider_id;
  const north = parseFloat(event.north);
  const west = parseFloat(event.west);
  const east = parseFloat(event.east);
  const south = parseFloat(event.south);
  // update driver position
  const [position, created] = await DriverPosition.findOrCreate({
    defaults: {
      latitude: 0,
      longitude: 0
    },
    where: {
      rider_id
    }
  });
  // update latitude & longitude
  let latitude = parseFloat(position.get("latitude") as string);
  latitude = latitude + north - south;
  let longitude = parseFloat(position.get("longitude") as string);
  longitude = longitude + east - west;

  console.log("driver %s position updated to %d and %d", rider_id, latitude, longitude);
  try {
    await position.update({
      latitude,
      longitude
    });
  } catch (err) {
    console.error(err);
  }
}

export async function getPosition(req: Request, res: Response) {
  const rider_id = req.params.rider_id;
  if (!rider_id) {
    res.status(400).json({
      ok: false,
      error: "parameter tidak lengkap"
    });
    return;
  }

  // get rider position
  const rider = await DriverPosition.findOne({
    where: { rider_id }
  });
  if (!rider) {
    res.status(404).json({
      ok: false,
      error: "rider tidak ditemukan"
    });
    return;
  }
  const latitude = rider.get("latitude");
  const longitude = rider.get("longitude");

  // encode output
  res.json({
    ok: true, latitude, longitude 
  });
}

export function positionProjector(): number {
  return bus.subscribe("rider.moved", (movement: Movement) => {
    positionUpdater(movement);
  });
}
