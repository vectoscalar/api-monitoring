// import Queue from "better-queue";
import Queue from "queue"; // Import the queue package
import { logger, axiosClient } from "../services";
import { ApiLogService } from "../../services/apiLog.service";
import { RequestLog } from "../../types";

interface QueueOptions {
  concurrency?: number; // Number of jobs to process simultaneously
  autostart?: boolean;   // Automatically start processing the queue
}

export class RequestLogQueue {
  private static instance: RequestLogQueue | null = null;
  private requestLogQueue: Queue | null;
  private queueOptions: QueueOptions | null;
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
    // const { batchSize, batchDelay, batchDelayTimeout } = queueOptions;

    // this.queueOptions = Object.assign(
    //   {},
    //   { batchSize, batchDelay, batchDelayTimeout },
    //   queueOptions
    // );

    // this.requestLogQueue = new Queue(
    //   this.apiLogService.saveRequestLogBatch.bind(this.apiLogService),
    //   this.queueOptions!
    // );

    this.requestLogQueue = new Queue({
      concurrency: 5, // Number of jobs to process simultaneously
      autostart: true, // Start processing automatically
    });
  }

  addRequestLog(requestLog: RequestLog) {
    // // this.requestLogQueue?.push(requestLog);

    // logger.trace(
    //   `RequestLogQueue -> addRequestLog: log added to queue: ${JSON.stringify(
    //     requestLog
    //   )}`
    // );

    // Add a job to the queue
    this.requestLogQueue.push((cb) => {
      // Call the saveRequestLogBatch method with the request log and a callback
      this.apiLogService.saveRequestLogBatch([requestLog], (err) => {
        if (err) {
          logger.error(`Error processing log: ${err}`);
          cb(err); // Pass the error to the callback
        } else {
          logger.trace(`RequestLogQueue -> addRequestLog: log added to queue: ${JSON.stringify(requestLog)}`);
          cb(); // Call the callback to indicate the job is done
        }
      });
    });
  }
}
