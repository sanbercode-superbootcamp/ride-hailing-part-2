import {initTracer, TracingConfig, TracingOptions} from 'jaeger-client'

export function createTracer(serviceName: string) {
    const config: TracingConfig = {
        serviceName,
        sampler: {
            type: 'const',
            param: 1,
        },
        reporter: {
            logSpans: true,
        }
    };

    const option: TracingOptions = {
        logger: {
            info(msg) {
                console.log("INFO ", msg);
            },
            error(msg){
                console.log('ERROR ', msg);
            }
        }
    };
    return initTracer(config, option);
}