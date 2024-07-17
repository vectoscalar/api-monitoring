import { FastifyInstance, FastifyPluginOptions, HookHandlerDoneFunction } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { MongooseClient } from './clients/mongoClient';
import { BaseService } from './common/services/index';
import { logger } from './common/services';

import { UserAccountService, ApiLogService, EndpointService, MicroServiceService} from './services'

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
    logLevel
  } = options;

  logger.init(logLevel)

  try {
    await MongooseClient.init(mongoUrl)

    const { organizationId, projectId, microserviceId } = await new UserAccountService().setAccountInfo(organizationName, gst, projectName, microserviceName);

    BaseService.setProperties({ organizationId, projectId, microserviceId });
    
    fastify.addHook('onRequest', async (request, reply) => {
      // Perform any necessary onRequest logic here
      logger.info('onRequest hook triggered');
    });

    fastify.addHook('onResponse', async (request, reply) => {
      // Perform any necessary onResponse logic here
      logger.info('onResponse hook triggered');
    });

  } catch (err) {
    logger.error(err);
    throw new Error('Failed to connect to MongoDB');
  }
}

export const apiMonitorPlugin = fastifyPlugin(ApiMonitor);

