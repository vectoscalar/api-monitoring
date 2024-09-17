import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { EC2RequestProcessorService } from "./";
import { axiosClient } from "../common/services";
import { EC2_METADATA_URL } from "../common/constant";

export class EC2Service {
  reqProcessorInstance: EC2RequestProcessorService | null;
  constructor() {
    this.reqProcessorInstance = new EC2RequestProcessorService();
  }

  setupHooks(fastifyInstance: FastifyInstance) {
    fastifyInstance.addHook(
      "onRequest",
      async (request: FastifyRequest, reply: FastifyReply) => {
        await this.reqProcessorInstance!.onRequestHandler(request);
      }
    );

    fastifyInstance.addHook(
      "onResponse",
      async (request: FastifyRequest, reply: FastifyReply) => {
        await this.reqProcessorInstance!.onResponseHandler(request, reply);
      }
    );

    fastifyInstance.addHook(
      "onSend",
      async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
        await this.reqProcessorInstance!.onSendHandler(request, reply, payload);
      }
    );
  }
}
