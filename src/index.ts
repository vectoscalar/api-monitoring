import {
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";
import fastifyPlugin from "fastify-plugin";

import { logger } from "./common/services";

import { apiMonitorInitializer, EndpointService, ApiLogService } from "./services";
import FastifyHookService from "./services/fastifyHooksSetUp.service";

interface PluginOptions extends FastifyPluginOptions {
  mongoUrl: string;
  organizationName: string;
  projectName: string;
  microserviceName: string;
  logLevel?: "trace" | "info";
  queueOptions?: object;
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
    await apiMonitorInitializer.init(mongoUrl, organizationName, projectName, microserviceName, logLevel || "error", queueOptions)

    new FastifyHookService(fastify);
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

