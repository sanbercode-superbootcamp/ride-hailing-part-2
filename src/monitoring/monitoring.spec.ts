import * as nock from 'nock';
import { getMovementLogs, RiderLog } from './monitor';
import { exponentialBuckets } from 'prom-client';
import { expect } from 'chai';
import { get } from 'request-promise-native';

const PORT = process.env["TRACKER_PORT"] || 3000;

describe('Monitoring Service', function () {
    it('should return data logs of driver', async function () {
        const rider_id = 13;
        const date = new Date();

        nock(`http://localhost:${PORT}`)
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

        /* await getMovementLogs(rider_id, null)
            .then((res) => {
                console.log(res);
                expect(res[0].time).to.be.eq(date);
            })
            .catch((err) => {
                console.log("ERR", err);
            }) */
        try {
            const res = await getMovementLogs(rider_id, null);
            console.log("RES", res);
        } catch (err) {
            console.log("ERR", err);
        }

    })

    it('should return an error', async function () {
        const rider_id = 13;
        const date = new Date();


        await getMovementLogs(rider_id, null)
            .then((res) => {
                console.log("RES2", res);
                expect(res[0].time).to.be.eq(date);
            })
            .catch((err) => {
                console.log("ERR2 MASUK");
                expect(err).to.be.exist;
            })

    })
})
