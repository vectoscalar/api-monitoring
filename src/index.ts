import {
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";
import fastifyPlugin from "fastify-plugin";

import { logger } from "./common/services";

import { InitializePlugin } from "./services";
import FastifyHookService from "./services/fastifyHooksSetUp.service";

interface PluginOptions extends FastifyPluginOptions {
  mongoUrl: string;
  organizationName: string;
  projectName: string;
  microserviceName: string;
  logLevel?: "trace" | "info";
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
  } = options;

  try {

    const initializePlugin = new InitializePlugin(mongoUrl, organizationName, projectName, microserviceName, logLevel || "error");
    const { organizationId, projectId, microserviceId } = await initializePlugin.init();

    const fastifyHookService = new FastifyHookService(fastify, organizationId, projectId, microserviceId);
    fastifyHookService.setupHooks();

  } catch (err: any) {
    logger.error("Error occured", err.message);
    throw new Error("Failed to connect to MongoDB");
  }
}

const apiMonitorPlugin = fastifyPlugin(ApiMonitor);
export default apiMonitorPlugin;

