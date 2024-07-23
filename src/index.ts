import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";

import * as dotenv from 'dotenv';
dotenv.config();

import { logger } from "./common/services";

import {
  apiMonitorService,
  EndpointService,
  ApiLogService,
  FastifyHookService,
} from "./services";

import Queue from "better-queue";

interface PluginOptions extends FastifyPluginOptions {
  mongoUrl: string;
  organizationName?: string;
  projectName?: string;
  microserviceName?: string;
  logLevel?: "trace" | "info";
  serviceApiKey?: string;
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
    logLevel = "error",
    serviceApiKey,
    queueOptions,
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
      queueOptions
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
