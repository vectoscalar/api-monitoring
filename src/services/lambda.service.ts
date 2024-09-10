import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { LambdaRequestProcessorService } from "./";

export class LambdaService {
  reqProcessorInstance: LambdaRequestProcessorService | null;
  constructor() {
    this.reqProcessorInstance = new LambdaRequestProcessorService();
  }

  setupHooks(fastifyInstance: FastifyInstance) {
    fastifyInstance.addHook(
      "onSend",
      async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
        await this.reqProcessorInstance!.onSendHandler(request, reply, payload);
        console.log("onSend hook completed");
        return payload;
      }
    );
  }
}
