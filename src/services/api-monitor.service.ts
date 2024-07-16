import Queue from "better-queue";
import { requestLogSchema } from "../joi-schema";
import { logger } from "../common/services";
import { RequestLog } from "../types";

export class RequestLogManager {
  private static instance: RequestLogManager | null = null;
  private requestLogQueue: Queue;
  private queueOptions: Partial<Queue.QueueOptions<any, any>>;

  private constructor(queueOptions: Partial<Queue.QueueOptions<any, any>>) {
    this.queueOptions = queueOptions;
    this.requestLogQueue = new Queue(this.saveRequestLogBatch, queueOptions);
  }

  static getInstance(queueOptions?: Partial<Queue.QueueOptions<any, any>>) {
    if (!RequestLogManager.instance) {
      this.instance = new RequestLogManager(
        queueOptions || {
          batchSize: 2,
          batchDelay: 10000,
          batchDelayTimeout: 10000,
        }
      );
    }
    return this.instance;
  }

  getTransformedLog({ request, reply, accountInfo }: any) {
    
    const protocol = request.protocol;
    const host = request.headers.host;
    const url = request.url;
    const requestUrl = `${protocol}://${host}${url}`;

    return {
      url: requestUrl,
      method: request.method,
      statusCode: reply.statusCode,
      errorMessage: reply.message || null,
      organizationId: accountInfo.organizationId,
      projectId: accountInfo.projectId,
      microserviceId: accountInfo.microserviceId,
      isSuccessfull: true,
    };
  }

  async saveRequestLogBatch(batch: RequestLog[], cb: Function) {
    logger.info(
      `RequestLogManager -> saveRequestLogBatch: ${JSON.stringify(batch)}`
    );

    // upsert endpoint record
    // TODO save metrics and precompute certain stats
    cb();
  }

  addRequestLog(requestLog: RequestLog) {
    logger.info(
      `RequestLogManager -> addRequestLog: ${JSON.stringify(requestLog)}`
    );
    // check if the Request Log is valid
    const validationResult = requestLogSchema.validate(requestLog);

    if (validationResult.error) {
      logger.error("Validation error:", validationResult.error.message);
      return;
    }

    this.requestLogQueue.push(requestLog);
  }
}
