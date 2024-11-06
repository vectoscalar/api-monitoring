import Queue from "queue";
import { logger, axiosClient } from "../services";
import { ApiLogService } from "../../services/apiLog.service";
import { RequestLog } from "../../types";

interface QueueOptions {
  concurrency?: number; 
  autostart?: boolean;   
  maxQueueSize?: number; 
  delayTimeout?: number;
}

export class RequestLogQueue {
  private static instance: RequestLogQueue | null = null;
  private requestLogQueue: Queue | null;
  private queueOptions: QueueOptions | null;
  public apiLogService: ApiLogService;
  private lastExecutionTime: number;
  private checkInterval: NodeJS.Timeout;

  private constructor() {
    this.apiLogService = new ApiLogService();
  }

  static getInstance() {
    if (!RequestLogQueue.instance) {
      this.instance = new RequestLogQueue();
    }
    return RequestLogQueue.instance;
  }

  init(queueOptions) {


    if (this.requestLogQueue) {
      logger.warn('Queue has already been initialized.');
      return; // Prevent re-initialization
    }

    this.queueOptions = queueOptions.queueOptions;
    this.requestLogQueue = new Queue({
      concurrency: 1,
      autostart: false,
    });

    console.log(this.queueOptions)


    this.lastExecutionTime = Date.now();

    this.checkInterval = null;
  }

  private startTimer() {
    if (!this.checkInterval) {
      this.checkInterval = setInterval(this.processQueueIfNeeded.bind(this), 100);
    }
  }

  private stopTimer() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null; //Reset to null
    }
  }


  addRequestLog(requestLog: RequestLog) {

    // When the first log being added
    if (this.requestLogQueue?.length === 0) {
      this.startTimer();
    }

    this.requestLogQueue?.push((cb) => {
      this.apiLogService.saveRequestLogBatch([requestLog], (err) => {
        if (err) {
          logger.error(`Error processing log: ${err}`);
          cb(err); 
        } else {
          logger.trace(`RequestLogQueue -> addRequestLog: log added to queue: ${JSON.stringify(requestLog)}`);
          cb(); 
        }
      });
    });
    logger.trace(`Log added to queue. Current queue size: ${this.requestLogQueue?.length}`);
  }

  private processQueueIfNeeded() {
    const currentTime = Date.now();
    const queueLength = this.requestLogQueue?.length || 0;

    // Return early if the queue is empty
    if (queueLength === 0) {
      this.stopTimer() 
      return;
    }

    // Check if queue is full or time limit has been reached
    if (
      queueLength >= (this.queueOptions?.maxQueueSize) ||
      currentTime - this.lastExecutionTime >= (this.queueOptions?.delayTimeout)
    ) {
      this.processQueue();
      this.lastExecutionTime = currentTime;
    }
  }

  private processQueue() {
    if (this.requestLogQueue && this.requestLogQueue.length > 0) {
      logger.trace('Processing logs in the queue...');

      // Start processing the queue
      this.requestLogQueue.start((err) => {
        if (err) {
          logger.error('Error processing jobs:', err);
        } else {
          logger.trace('Logs processed successfully');
        }

        // Immediately check if there are logs left in the queue
        if (this.requestLogQueue.length > 0) {
          this.processQueue(); // Keep processing if there are more logs
        } else {
          this.stopTimer(); // Stop the timer when the queue is empty after processing
        }
      });
    }
  }

  stop() {
    this.stopTimer(); // Ensure timer is stopped when the queue is stopped
  }
}
