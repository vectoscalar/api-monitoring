import { FastifyInstance, preSerializationHookHandler } from 'fastify';
import { v4 as uuidv4 } from 'uuid'; 
import { logger } from '../common/services';
import { RequestLogManager } from './';

class FastifyHookService {
  private fastify: FastifyInstance;
  private organizationId: string;
  private projectId: string;
  private microserviceId: string;
  private requestLogManager: RequestLogManager;
  private requestTimes: Map<string, { startTime: Date, hrStartTime: [number, number] }>;

  constructor(fastify: FastifyInstance, organizationId: string, projectId: string, microserviceId: string) {
    this.fastify = fastify;
    this.organizationId = organizationId;
    this.projectId = projectId;
    this.microserviceId = microserviceId;
    this.requestLogManager = RequestLogManager.getInstance()!;
    this.requestTimes = new Map();
  }

  public setupHooks() {
    this.fastify.addHook("onRequest", async (request: any, reply) => {
      if (!request.id) {
        request.id = uuidv4();
      }

      const startTime = new Date();
      const hrStartTime = process.hrtime();
      this.requestTimes.set(request.id, { startTime, hrStartTime });

      logger.info(
        `[Request ID: ${request.id}] Request for ${request.method} ${request.url} started at: ${startTime.toISOString()}`
      );
    });

    this.fastify.addHook("onResponse", async (request: any, reply) => {
      const requestId = request.id;

      const requestTimes = this.requestTimes.get(requestId);
      
      if(requestTimes) {
        const { startTime, hrStartTime } = requestTimes;
        this.requestTimes.delete(requestId);

        setImmediate(async () => {
          const hrEndTime = process.hrtime(hrStartTime);
          const elapsedTime = (hrEndTime[0] * 1e9 + hrEndTime[1]) / 1e6;

          const endTime = new Date(startTime.getTime() + elapsedTime);

          logger.info(
            `[Request ID: ${requestId}] Request for ${request.method} ${request.url} started at: ${startTime.toISOString()}, ended at: ${endTime.toISOString()}, Elapsed time: ${elapsedTime.toFixed(2)} ms`
          );

          logger.trace("onResponse reply", reply);

          const requestLog = this.requestLogManager.getTransformedLog({
            request,
            reply,
            accountInfo: { organizationId: this.organizationId, projectId: this.projectId, microserviceId: this.microserviceId },
          });

          logger.trace(
            `onResponse hook transformed request log ${JSON.stringify(requestLog)}`
          );

          this.requestLogManager.addRequestLog(requestLog);
        });
      }

      //   const hrEndTime = process.hrtime(hrStartTime);
      //   const elapsedTime = (hrEndTime[0] * 1e9 + hrEndTime[1]) / 1e6;

      //   logger.trace("onResponse reply", reply);

      //   const requestLog = this.requestLogManager.getTransformedLog({
      //     request,
      //     reply,
      //     accountInfo: { organizationId: this.organizationId, projectId: this.projectId, microserviceId: this.microserviceId },
      //   });

      //   const endTime = new Date(startTime.getTime() + elapsedTime);

      //   logger.trace(
      //     `onResponse hook transformed request log ${JSON.stringify(requestLog)}`
      //   );

      //   logger.info(
      //     `[Request ID: ${requestId}] Request for ${request.method} ${request.url} started at: ${startTime.toISOString()}, ended at: ${endTime.toISOString()}, Elapsed time: ${elapsedTime.toFixed(2)} ms`
      //   );

      //   this.requestLogManager.addRequestLog(requestLog);
      // });
    });

    this.fastify.addHook("preSerialization", (async (
      request: any,
      reply: any,
      payload: any
    ) => {
      reply.payload = payload;
      return payload;
    }) as preSerializationHookHandler);
  }
}

export default FastifyHookService;
