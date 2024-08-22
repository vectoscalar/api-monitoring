import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

import { logger, requestLogQueue } from "./common/services";

import {
  EndpointService,
  ApiLogService,
  FastifyHookService,
  userAccountService,
} from "./services";

import { PluginOptions } from "./types";

/**
 * Plugin
 * @param fastify
 * @param options
 */
async function initServices(options: PluginOptions) {
  try {
    requestLogQueue.init(options);

    await userAccountService.init(options);
  } catch (err: any) {
    console.log("error", err);
    logger.error("initServices failed:");
    throw err;
  }
}

const apiMonitor = async (fastify: FastifyInstance, options: PluginOptions) => {
  try {
    options.lambdaEnv = options.lambdaEnv ?? false;

    logger.init(options.logLevel || "error");

    await initServices(options);

    //init fastify hooks
    new FastifyHookService().setupHooks(fastify, {
      lambdaEnv: options.lambdaEnv,
    });
  } catch (err: any) {
    logger.error("Error occured in api monitor plugin", err);
    throw err;
  }
};

const apiMonitorPlugin = fastifyPlugin(apiMonitor);

export default apiMonitorPlugin;

export { ApiLogService, EndpointService };
