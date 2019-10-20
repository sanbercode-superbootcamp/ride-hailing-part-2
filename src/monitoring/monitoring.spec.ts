import { getMovementLogs } from './monitor';
import * as nock from "nock";
import { expect } from "chai";;

const TRACKER_PORT = 3000;

describe('Monitoring Servie', function() {
    it('harusnya muncul data log server',  async function() {
        const rider_id = 1;
        const date = new Date();

        nock(`http://localhost:${TRACKER_PORT}`)
            .get(`/movement/${rider_id}`)
            .reply(200, {
                ok: true,
                logs: [{
                    time: date,
                    east: 200,
                    west: 1000,
                    north: 300,
                    south: 1200
                }]
            })
        
        const response: any = await getMovementLogs(rider_id, null);
        console.log(response)

        expect(response).to.be.equal([{
            time: date,
            east: 200,
            west: 1000,
            north: 300,
            south: 1200
        }])
    })
})