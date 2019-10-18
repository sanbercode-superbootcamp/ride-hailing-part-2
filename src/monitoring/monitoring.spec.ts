import * as nock from "nock";
import { expect } from "chai";
import { getMovementLogs } from "./monitor";

const TRACKER_PORT = process.env["TRACKER_PORT"] || 3000;

describe('Monitoring Service', () => {
  it('return driver logs', async () => {
    const rider_id = 1;
    const date = new Date();
    nock(`http://localhost:${TRACKER_PORT}`)
      .get(`/movement/${rider_id}`)
      .reply(200, {
        ok: true,
        logs: {
          time: date,
          east: 0,
          west: 0,
          north: 20,
          south: 0
        }
      });

    const response: any = await getMovementLogs(rider_id, null);
    console.log(response);
    const expected = {
      time: date,
      east: 0,
      west: 0,
      north: 20,
      south: 0
    }
    expect(response).to.be.eq(expected);
  });
})