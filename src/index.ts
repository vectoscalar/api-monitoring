import {
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";
import fastifyPlugin from "fastify-plugin";

import { logger } from "./common/services";

import { apiMonitorService, EndpointService, ApiLogService, FastifyHookService } from "./services";

import Queue from "better-queue";

interface PluginOptions extends FastifyPluginOptions {
  mongoUrl: string;
  organizationName: string;
  projectName: string;
  microserviceName: string;
  logLevel?: "trace" | "info";
  queueOptions?: Queue.QueueOptions<any, any>;
}

/**
 * Plugin
 *
 * @param fastify
 * @param options
 */
async function ApiMonitor(fastify: FastifyInstance, options: PluginOptions) {
  const {
    mongoUrl,
    organizationName,
    projectName,
    microserviceName,
    logLevel,
    queueOptions
  } = options;

  try {
    await apiMonitorService.init(mongoUrl, organizationName, projectName, microserviceName, logLevel || "error", queueOptions)

    const fastifyHookService = new FastifyHookService();
    fastifyHookService.setupHooks(fastify);
  } catch (err: any) {
    logger.error("Error occured", err.message);
    throw new Error("Failed to connect to MongoDB");
  }
}

const apiMonitorPlugin = fastifyPlugin(ApiMonitor);
export default apiMonitorPlugin;

export {
  ApiLogService,
  EndpointService
}

