import { FastifyInstance, preSerializationHookHandler } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../common/services';
import { processManagerService } from './';

export class FastifyHookService {
  private fastify: FastifyInstance;


  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.setupHooks()
  }

  setupHooks() {
    this.fastify.addHook("onRequest", async (request: any, reply) => {
      processManagerService.onRequestHander(request)
    });

    this.fastify.addHook("onResponse", async (request: any, reply: any) => {
      processManagerService.onResponseHandler(request, reply, reply.payload);
    });



    this.fastify.addHook("onSend", (async (request: any, reply: any, payload: any) => {
      processManagerService.onSendHandler(request, reply, payload)
    }) as preSerializationHookHandler);
  }
}
