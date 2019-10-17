<<<<<<< HEAD
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
=======
import { initTracer, TracingOptions, TracingConfig } from "jaeger-client";

export function createTracer(serviceName: string) {
  const config: TracingConfig = {
    serviceName,
    sampler: {
      type: "const",
      param: 1
    },
    reporter: {
      logSpans: true
    }
  };
  const options: TracingOptions = {
    logger: {
      info(msg) {
        console.log("INFO ", msg);
      },
      error(msg) {
        console.log("ERROR", msg);
      }
    }
  };
  return initTracer(config, options);
}
>>>>>>> 06940fdf238ee9d91c8d29999843fc781a8c26ed
