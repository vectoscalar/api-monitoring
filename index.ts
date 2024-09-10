import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

import { logger, requestLogQueue } from "./src/common/services";

import {
  EndpointService,
  ApiLogService,
  FastifyHookService,
  userAccountService,
} from "./src/services";

import { PluginOptions } from "./src/types";
import { systemMetrics } from "./src/services/system.metrics";

class APIMonitorPlugin {
  options: PluginOptions;

  constructor() {
    this.options = {
      lambdaEnv: false,

      queueOptions: {
        batchSize: 2,
        batchDelay: 10000,
        batchDelayTimeout: 10000,
      },
      logLevel: "error",
      accountInfo: undefined,
      serviceApiKey: undefined,
    };
  }

  setOptions(options: PluginOptions) {
    this.options = {
      ...options,
      lambdaEnv: options.lambdaEnv ?? false,

      queueOptions: {
        ...this.options.queueOptions,
        batchSize: options.lambdaEnv
          ? 1
          : options.queueOptions?.batchSize ||
            this.options.queueOptions?.batchSize,
      },
    };
  }

  async initServices() {
    try {
      requestLogQueue.init(this.options);

      await userAccountService.init(this.options);
    } catch (err: any) {
      logger.error("initServices failed:");
      throw err;
    }
  }

  async init(fastify: FastifyInstance, options: PluginOptions) {
    try {
      this.setOptions(options);

      logger.init(this.options.logLevel!);

      await this.initServices();

      //init fastify hooks
      new FastifyHookService().setupHooks(fastify, {
        lambdaEnv: options.lambdaEnv,
      });

      if(!options.lambdaEnv) {
        systemMetrics.startMonitoring()
      }
    } catch (err: any) {
      logger.error("Error occured in api monitor plugin", err.message);
      throw err;
    }
  }
}

const pluginInstance = new APIMonitorPlugin();

const apiMonitorPlugin = fastifyPlugin(
  pluginInstance.init.bind(pluginInstance)
);

export default apiMonitorPlugin;

export { ApiLogService, EndpointService };
