import * as nock from 'nock';
import { getMovementLogs, RiderLog, getPosition, getPoint } from './monitor';
import { exponentialBuckets } from 'prom-client';
import { expect } from 'chai';
import { get } from 'request-promise-native';

const TRACKER_PORT = process.env["TRACKER_PORT"] || 3000;
const POSITION_PORT = process.env["POSITION_PORT"] || 3001;
const POINT_PORT = process.env["POINT_PORT"] || 3003;

describe('Monitoring Service - Mocking Data', function () {
    it('should return data logs of driver', async function () {
        const rider_id = 13;
        const date = new Date().toDateString();
        console.log(date);

        nock(`http://localhost:${TRACKER_PORT}`)
            .get(`/movement/${rider_id}`)
            .reply(200, {
                ok: true,
                logs: [{
                    time: date,
                    east: 10,
                    north: 0,
                    south: 0,
                    west: 0
                }]
            })

        try {
            const res: RiderLog[] = await getMovementLogs(rider_id, null);
            console.log("RES", res);
            expect(res[0].time).to.be.eq(date);
        } catch (err) {
            console.log("ERR", err);
        }

    })

    it('should return data last position of driver', async function () {
        const rider_id = 13;
        const date = new Date();

        nock(`http://localhost:${POSITION_PORT}`)
            .get(`/position/${rider_id}`)
            .reply(200, {
                ok: true,
                latitude: 10,
                longitude: 60
            })

        try {
            const res = await getPosition(rider_id, null);
            console.log("RES2", res);
            expect(res['latitude']).to.be.eq(10);
        } catch (err) {
            console.log("ERR2", err);
        }

    })
    it('should return data point of driver', async function () {
        const rider_id = 13;
        const date = new Date();

        nock(`http://localhost:${POINT_PORT}`)
            .get(`/point/${rider_id}`)
            .reply(200, {
                ok: true,
                point: 5
            })

        try {
            const res = await getPoint(rider_id, null);
            console.log("RES3", res);
            expect(res['point']).to.be.eq(5);
        } catch (err) {
            console.log("ERR3", err);
        }

    })
})
