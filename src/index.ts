import { FastifyInstance, FastifyPluginOptions, } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { MongooseClient } from './clients/mongoClient';
import { v4 as uuidv4 } from 'uuid';


import { logger } from "./common/services";
import { UserAccountService } from "./services";
import { RequestLogManager } from "./services/api-monitor.service";

interface PluginOptions extends FastifyPluginOptions {
  mongoUrl: string;
  organizationName: string;
  projectName: string;
  microserviceName: string;
  gst: string;
  logLevel?: 'trace' | 'info';
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
    logger.init(logLevel || 'error')

    await MongooseClient.init(mongoUrl)


    const { organizationId, projectId, microserviceId } = await new UserAccountService().setAccountInfo(organizationName, gst, projectName, microserviceName);


    fastify.addHook("onRequest", async (request: any, reply) => {
      request.id = uuidv4();
      request.startTime = new Date(); 
      request.hrStartTime = process.hrtime(); 
      logger.info(`[Request ID: ${request.id}] Request for ${request.method} ${request.url} started at: ${request.startTime.toISOString()}`);
    });

    fastify.addHook("onResponse", async (request: any, reply) => {

      const hrEndTime = process.hrtime(request.hrStartTime); 
      const elapsedTime = (hrEndTime[0] * 1e9 + hrEndTime[1]) / 1e6; 
      logger.trace("onResponse reply", reply);

      const requestLogManager = RequestLogManager.getInstance();

      const requestLog = requestLogManager!.getTransformedLog({
        request,
        reply,
        accountInfo: { organizationId, projectId, microserviceId },
      });

      const endTime = new Date(request.startTime.getTime() + elapsedTime); 

      logger.trace(
        `onResponse hook transformed request log ${JSON.stringify(requestLog)}`
      );

      logger.info(
        `[Request ID: ${request.id}] Request for ${request.method} ${request.url} started at: ${request.startTime.toISOString()}, ended at: ${endTime.toISOString()}, Elapsed time: ${elapsedTime.toFixed(2)} ms`
      );

      requestLogManager?.addRequestLog(requestLog);
    });
  } catch (err) {
    logger.error(err);
    throw new Error("Failed to connect to MongoDB");
  }
}

export const apiMonitorPlugin = fastifyPlugin(ApiMonitor);
