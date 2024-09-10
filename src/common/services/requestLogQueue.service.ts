import Queue from "better-queue";
import { requestLogSchema } from "../../joi-schema";
import { logger, axiosClient } from "../services";
import { ApiLogService } from "../../services/apiLog.service";
import { RequestLog } from "../../types";

export class RequestLogQueue {
  private static instance: RequestLogQueue | null = null;
  private requestLogQueue: Queue | null;
  private queueOptions: Partial<Queue.QueueOptions<any, any>> | null;
  public apiLogService: ApiLogService;

  private constructor() {
    this.queueOptions = null;
    this.apiLogService = new ApiLogService();
    this.requestLogQueue = null;
  }

  static getInstance() {
    if (!RequestLogQueue.instance) {
      this.instance = new RequestLogQueue();
    }
    return RequestLogQueue.instance;
  }

  init(queueOptions) {
    const { batchSize, batchDelay, batchDelayTimeout } = queueOptions;

    this.queueOptions = Object.assign(
      {},
      { batchSize, batchDelay, batchDelayTimeout },
      queueOptions
    );

    this.requestLogQueue = new Queue(
      this.apiLogService.saveRequestLogBatch.bind(this.apiLogService),
      this.queueOptions!
    );
  }

  // check if the Request Log is valid before pushing in queue
  static validateRequestLog(requestLog: RequestLog, cb: Function) {
    const validationResult = requestLogSchema.validate(requestLog);

    if (validationResult.error) {
      const errorMsg = `RequestLogManager -> validation failed for log: ${JSON.stringify(
        requestLog
      )},
      Error:${validationResult.error.message}`;

      logger.error(errorMsg);

      return cb(errorMsg);
    }

    return cb(null, requestLog);
  }

  addRequestLog(requestLog: RequestLog) {
    this.requestLogQueue?.push(requestLog);

    logger.trace(
      `RequestLogQueue -> addRequestLog: log added to queue: ${JSON.stringify(
        requestLog
      )}`
    );
    console.log("queue stats", this.requestLogQueue?.getStats());
  }
}
