import {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
  FastifyRequest,
  FastifyReply,
  preSerializationHookHandler,
} from "fastify";
import fastifyPlugin from "fastify-plugin";
import { MongoClient, Db } from "mongodb";
import { MongooseClient } from "./clients/mongoClient";

import { logger } from "./common/services";

import { UserAccountService, RequestLogManager } from "./services";

interface PluginOptions extends FastifyPluginOptions {
  mongoUrl: string;
  organizationName: string;
  projectName: string;
  microserviceName: string;
  gst: string;
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
    gst,
    logLevel,
  } = options;

  try {
    logger.init(logLevel || "error");

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

    fastify.addHook("preSerialization", (async (
      request: any,
      reply: any,
      payload: any
    ) => {
      reply.payload = payload;
      return payload;
    }) as preSerializationHookHandler);

    fastify.addHook("onResponse", async (request, reply) => {
      logger.trace("onResponse reply", reply);

      const requestLogManager = RequestLogManager.getInstance();

      const requestLog = requestLogManager!.getTransformedLog({
        request,
        reply,
        accountInfo: { organizationId, projectId, microserviceId },
      });

      requestLogManager?.addRequestLog(requestLog);
    });
  } catch (err: any) {
    logger.error("Error occured", err.message);
    throw new Error("Failed to connect to MongoDB");
  }
}

export const apiMonitorPlugin = fastifyPlugin(ApiMonitor);
