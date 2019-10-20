import * as nock from "nock";
import { getMovementLogs, getPosition, getPoint } from "./monitor";
import { expect } from "chai";

const TRACKER_PORT = process.env["TRACKER_PORT"] || 3000
const POSITION_PORT = process.env["POSITION_PORT"] || 3001
const PERFORMANCE_PORT = process.env["PERFORMANCE_PORT"] || 3003

describe('Monitoring Service', () => {
    it('harusnya return data logs driver', async () => {
        const rider_id = 2;
        const date = new Date().toString()
        
        nock(`http://localhost:${TRACKER_PORT}`)
            .get(`/movement/${rider_id}`)
            .reply(200, {
                ok : true,
                logs : [{
                    time: date,
                    east: 6,
                    west: 3,
                    north: 2,
                    south: 1
                }]
            })

        const response: any = await getMovementLogs(rider_id, null)
        expect(response).to.be.deep.equal([{
            time: date,
            east: 6,
            west: 3,
            north: 2,
            south: 1
        }])
    })
    it('harusnya return data posisi driver', async () => {
        const rider_id = 2;
        nock(`http://localhost:${POSITION_PORT}`)
            .get(`/position/${rider_id}`)
            .reply(200, {
                ok:true,
                latitude: 2,
                longitude: 2
            });

        const response: any = await getPosition(rider_id, null);
        expect(response).to.be.deep.eq({
            latitude: 2,
            longitude: 2
        });
    })
    it('harusnya return data point driver', async () => {
        const rider_id = 2;
        nock(`http://localhost:${PERFORMANCE_PORT}`)
            .get(`/point/${rider_id}`)
            .reply(200, {
                ok:true,
                point : 5
            });

        const response: any = await getPoint(rider_id, null);
        expect(response).to.be.deep.eq({
            point : 5
        });
    })
})