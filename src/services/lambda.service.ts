import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { LambdaRequestProcessorService } from "./";

export class LambdaService {
  reqProcessorInstance: LambdaRequestProcessorService | null;
  constructor() {
    this.reqProcessorInstance = new LambdaRequestProcessorService();
  }

  setupHooks(fastifyInstance: FastifyInstance) {
    fastifyInstance.addHook("onSend", (request, reply, payload, done) => {
      this.reqProcessorInstance.onSendHandler(request, reply, payload, done);
    });
  }
}
