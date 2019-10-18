import {getMovementLogs, getPosition, getScore} from './monitor'
import * as nock from 'nock'
import {expect} from 'chai'

const TRACKER_PORT = process.env["TRACKER_PORT"] || 3000;
const POSITION_PORT = process.env["POSITION_PORT"] || 3001;
const SCORE_PORT = process.env["SCORE_PORT"] || 3003;

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

    it('harusnya return data position driver', async function() {
        const rider_id = 5;
        const date = new Date();
        nock(`http://localhost:${POSITION_PORT}`).
        get(`/position/${rider_id}`).
        reply(200, {
            ok:true,
            latitude: 10,
            longitude: 10
        });

        const response: any = await getPosition(rider_id, null);
        console.log(response)
        expect(response).to.be.deep.eq({
            latitude: 10,
            longitude: 10
        });
    })

    it('harusnya return data score driver', async function() {
        const rider_id = 5;
        nock(`http://localhost:${SCORE_PORT}`).
        get(`/point/${rider_id}`).
        reply(200, {
            ok:true,
            point: 10
        });

        const response: any = await getScore(rider_id, null);
        console.log(response)
        expect(response.point).to.be.equal(10);
    })
})