import { FastifyInstance, FastifyPluginOptions, HookHandlerDoneFunction } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { MongoClient, Db } from 'mongodb';
import { MongooseClient } from './clients/mongoClient';

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
async function fastifyMongoDBPlugin(fastify: FastifyInstance, options: MongoPluginOptions) {
  
  try {
    await MongooseClient.init()

    fastify.addHook('onRequest', async (request, reply) => {
      // Perform any necessary onRequest logic here
      console.log('onRequest hook triggered');
    });

    fastify.addHook('onResponse', async (request, reply) => {
      // Perform any necessary onResponse logic here
      console.log('onResponse hook triggered');
    });

  } catch (err) {
    console.error(err);
    throw new Error('Failed to connect to MongoDB');
  }
}

export const mongoDBPlugin = fastifyPlugin(fastifyMongoDBPlugin);




