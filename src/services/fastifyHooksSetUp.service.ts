import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { processManagerService } from "./";

export class FastifyHookService {
  setupHooks(fastifyInstance: FastifyInstance, { lambdaEnv }: any) {
    fastifyInstance.addHook(
      "onRequest",
      async (request: FastifyRequest, reply: FastifyReply) => {
        console.log(`FastifyHookService: isLambda: ${lambdaEnv}`);
        if (lambdaEnv) {
          await processManagerService.onRequestHandler(request);
        } else {
          setImmediate(() => processManagerService.onRequestHandler(request));
        }
      }
    );

    fastifyInstance.addHook(
      "onResponse",
      async (request: FastifyRequest, reply: FastifyReply) => {
        if (lambdaEnv) {
          await processManagerService.onResponseHandler(request, reply, {
            lambdaEnv,
          });
        } else {
          setImmediate(() =>
            processManagerService.onResponseHandler(request, reply)
          );
        }
      }
    );

    fastifyInstance.addHook(
      "onSend",
      async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
        if (lambdaEnv) {
          await processManagerService.onSendHandler(request, reply, payload);
        } else {
          setImmediate(() =>
            processManagerService.onSendHandler(request, reply, payload)
          );
        }
      }
    );
  }
}
