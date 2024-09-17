import Queue from "better-queue";
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

  addRequestLog(requestLog: RequestLog) {
    this.requestLogQueue?.push(requestLog);

    logger.trace(
      `RequestLogQueue -> addRequestLog: log added to queue: ${JSON.stringify(
        requestLog
      )}`
    );
  }
}
