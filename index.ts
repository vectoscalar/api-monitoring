import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";

import { logger, RequestLogQueue } from "./src/common/services";

import {
  EndpointService,
  ApiLogService,
  UserAccountService,
  LambdaService,
  EC2Service,
} from "./src/services";

import { DEFAULT_PLUGIN_OPTIONS } from "./src/common/constant";
import { PluginOptions } from "./src/types";
import { APIMonitorMongooseClient } from "./src/clients/mongoClient";

class APIMonitorPlugin {
  options: PluginOptions;

  constructor(options: PluginOptions) {
    this.options = {
      ...options,
      lambdaEnv: options.lambdaEnv ?? false,
      queueOptions: {
        ...DEFAULT_PLUGIN_OPTIONS.queueOptions,
      },
      logLevel: options.logLevel || "error",
    };
  }

  async initServices(fastify: FastifyInstance) {
    try {
      logger.init(this.options.logLevel);

      const { serviceApiKey, accountInfo, lambdaEnv } = this.options;

      await APIMonitorMongooseClient.initConnection({
        serviceApiKey,
        accountInfo,
      });

      UserAccountService.getInstance()!.setupUserAccountInfo({
        serviceApiKey,
        accountInfo,
      });

      const serviceInstance = lambdaEnv
        ? new LambdaService()
        : new EC2Service();

      serviceInstance.setupHooks(fastify);

      RequestLogQueue.getInstance()!.init(this.options);
    } catch (err) {
      logger.error(
        `APIMonitorPlugin : initServices failed: ${JSON.stringify(err)}`
      );
      throw err;
    }
  }
}
const apiMonitorPlugin: FastifyPluginAsync<PluginOptions> = fastifyPlugin(
  async (fastify, options) => {
    const pluginInstance = new APIMonitorPlugin(options);
    await pluginInstance.initServices(fastify);
  }
);
export default apiMonitorPlugin;

export { ApiLogService, EndpointService };
