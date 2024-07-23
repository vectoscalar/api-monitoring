import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { processManagerService } from './';

export class FastifyHookService {

  setupHooks(fastifyInstance: FastifyInstance) {
    fastifyInstance.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
      processManagerService.onRequestHander(request)
    });

    fastifyInstance.addHook("onResponse", async (request: FastifyRequest, reply: FastifyReply) => {
      processManagerService.onResponseHandler(request, reply);
    });

    fastifyInstance.addHook("onSend", async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
      processManagerService.onSendHandler(request, reply, payload);
    });
  }
}
