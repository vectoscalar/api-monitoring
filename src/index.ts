import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";

import { logger } from "./common/services";

import {
  apiMonitorService,
  EndpointService,
  ApiLogService,
  FastifyHookService,
} from "./services";

import Queue from "better-queue";

interface AccountInfo {
  mongoUrl: string;
  organizationName: string;
  projectName: string;
  microserviceName: string;
}

interface PluginOptions extends FastifyPluginOptions {
  accountInfo?: AccountInfo;
  logLevel?: "trace" | "info" | "error";
  serviceApiKey?: string;
  queueOptions?: Queue.QueueOptions<any, any>;
  useLocal?: boolean;
}

/**
 * Plugin
 *
 * @param fastify
 * @param options
 */
async function ApiMonitor(fastify: FastifyInstance, options: PluginOptions) {

  const {
    accountInfo: {
      mongoUrl,
      organizationName,
      projectName,
      microserviceName
    } = {},
    logLevel = "error",
    serviceApiKey,
    queueOptions,
    useLocal
  } = options;

  try {
    const fastifyHookService = new FastifyHookService();

    await apiMonitorService.init(
      mongoUrl,
      organizationName,
      projectName,
      microserviceName,
      logLevel,
      serviceApiKey,
      queueOptions,
      useLocal
    );

    fastifyHookService.setupHooks(fastify);

  } catch (err: any) {
    logger.error("Error occured", err.message);
    throw err;
  }
}

const apiMonitorPlugin = fastifyPlugin(ApiMonitor);
export default apiMonitorPlugin;

export { ApiLogService, EndpointService };
