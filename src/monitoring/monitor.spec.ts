import {getMovementLogs} from './monitor'
import * as nock from 'nock'
import {expect} from 'chai'

const TRACKER_PORT = process.env["TRACKER_PORT"] || 3000;

describe('Monitoring Service', function() {
    it('harusnya return data logs driver', async function() {
        const rider_id = 5;
        const date = new Date();
        nock(`http://localhost:${TRACKER_PORT}`).
        get(`/movement/${rider_id}`).
        reply(200, {
            ok:true,
            logs: {
                east: 6,
                west: 3,
                north: 2,
                south: 1
            }
        });

        const response: any = await getMovementLogs(rider_id, null);
        console.log(response)
        expect(response.east).to.be.equal(6);
    })
})