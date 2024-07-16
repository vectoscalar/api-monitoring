import { FastifyInstance, FastifyPluginOptions, HookHandlerDoneFunction } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { MongoClient, Db } from 'mongodb';
import { MongooseClient } from './clients/mongoClient';

import { logger } from './common/services';

import { ProjectDAO, OrganizationDAO, MicroserviceDAO } from './dao';

interface MongoPluginOptions extends FastifyPluginOptions {
  mongoUrl: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    mongo: MongoClient;
  }
  interface FastifyRequest {
    mongo: MongoClient;
  }
}

/**
 * Plugin
 * 
 * @param fastify 
 * @param options 
 */
async function MetricMonitor(fastify: FastifyInstance, options: MongoPluginOptions) {

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

    const org: any = await new OrganizationDAO().upsertOrganization(organizationName, gst);
    logger.info('Organization created ', org)

    const project: any = await new ProjectDAO().upsertProject(org.id, projectName);
    logger.info('Project created ', project)

    const microservice = await new MicroserviceDAO().upsertMicroservice(project.id, microserviceName);
    logger.info('Microservice created ', microservice)

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

export const metricMonitorPlugin = fastifyPlugin(MetricMonitor);




