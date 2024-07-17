import {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import fastifyPlugin from "fastify-plugin";
import { MongoClient, Db } from "mongodb";
import { MongooseClient } from "./clients/mongoClient";

import { logger } from "./common/services";

import { UserAccountService } from "./services";
import { RequestLogManager } from "./services/api-monitor.service";

interface PluginOptions extends FastifyPluginOptions {
  mongoUrl: string;
  organizationName: string;
  projectName: string;
  microserviceName: string;
  gst: string;
  logLevel: string;
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
    gst,
    logLevel,
  } = options;

  logger.init(logLevel);

  try {
    await MongooseClient.init(mongoUrl);

    const { organizationId, projectId, microserviceId } =
      await new UserAccountService().setAccountInfo(
        organizationName,
        gst,
        projectName,
        microserviceName
      );

    fastify.addHook("onRequest", async (request, reply) => {
      // Perform any necessary onRequest logic here
      logger.info("onRequest hook triggered");
    });

    fastify.addHook("onResponse", async (request, reply) => {
      console.log("onResponse request");

      const requestLogManager = RequestLogManager.getInstance();

      const requestLog = requestLogManager!.getTransformedLog({
        request,
        reply,
        accountInfo: { organizationId, projectId, microserviceId },
      });

      logger.info(
        `onResponse hook transformed request log ${JSON.stringify(requestLog)}`
      );

      requestLogManager?.addRequestLog(requestLog);
    });
  } catch (err) {
    logger.error(err);
    throw new Error("Failed to connect to MongoDB");
  }
}

export const apiMonitorPlugin = fastifyPlugin(ApiMonitor);
