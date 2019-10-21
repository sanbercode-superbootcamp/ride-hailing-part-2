import * as nock from 'nock';
import { getMovementLogs, getRiderPerformance, TRACKER_PORT, PERFORMANCE_PORT } from './monitor';
import { expect } from 'chai';

describe('Monitoring Service', function () {
    it("harus return data logs", async function () {
        const rider_id = 2;
        const date = new Date().toString();

        nock(`http://localhost:${TRACKER_PORT}`)
            .get(`/movement/${rider_id}`)
            .reply(200, {
                ok: true,
                logs: [{
                    time: date,
                    east: 1,
                    west: 3,
                    north: 2,
                    south: 1

                }]
            });

        try {
            const response: any = await getMovementLogs(rider_id, null);
            //console.log(response[0]);
            expect(response).to.be.deep.eq([{
                time: date,
                east: 1,
                west: 3,
                north: 2,
                south: 1
            }]);
        } catch (err) {
            console.log("ERROR", err);
        }
    });

    // check performance rider query
    it("harus return data poin rider", async function () {
        const rider_id = 2;
        const date = new Date().toString();

        nock(`http://localhost:${PERFORMANCE_PORT}`)
            .get(`/point/${rider_id}`)
            .reply(200, {
                ok: true,
                point: 100
            });

        try {
            const response: any = await getRiderPerformance(rider_id, null);
            //console.log(response[0]);
            expect(response).to.be.deep.eq([{
                time: date,
                east: 1,
                west: 3,
                north: 2,
                south: 1
            }]);
        } catch (err) {
            console.log("ERROR", err);
        }
    });
});
