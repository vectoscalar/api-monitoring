import Queue from "better-queue";
import { requestLogSchema } from "../joi-schema";
import { logger } from "../common/services";
import { RequestLog } from "../types";
import { APILogDAO, EndpointDAO } from "../dao";

export class RequestLogManager {
  private static instance: RequestLogManager | null = null;
  private requestLogQueue: Queue;
  private queueOptions: Partial<Queue.QueueOptions<any, any>>;
  private endpointDAO: EndpointDAO;
  private apiLogDAO: APILogDAO;

  private constructor(queueOptions: Partial<Queue.QueueOptions<any, any>>) {
    this.queueOptions = queueOptions;
    this.endpointDAO = new EndpointDAO();
    this.apiLogDAO = new APILogDAO();
    this.requestLogQueue = new Queue(
      this.saveRequestLogBatch.bind(this),
      queueOptions
    );
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

    const successRegex = /^[23]\d+$/;
    const isSuccessfull = successRegex.test(reply.statusCode.toString());

    console.log("reoly object", reply.error);

    return {
      url: requestUrl,
      method: request.method,
      statusCode: reply.statusCode,
      errorMessage:
        (!isSuccessfull && (reply.message || reply.raw.statusMessage)) || null,
      organizationId: accountInfo.organizationId,
      projectId: accountInfo.projectId,
      microserviceId: accountInfo.microserviceId,
      isSuccessfull,
      responseTime: reply.elapsedTime,
      ipAddress: request.ip,
    };
  }

  getEndpointsRecordsForBatch(batch: RequestLog[]) {
    const endpointsMap: { [key: string]: any } = {};

    batch.forEach((requestLog) => {
      const url = requestLog.url;

      if (!endpointsMap.hasOwnProperty(url)) {
        endpointsMap[url] = {
          url: requestLog.url,
          method: requestLog.method,
          responseTime: 0,
          totalInvocationCount: 0,
          microserviceId: requestLog.microserviceId,
        };
      }
      endpointsMap[url].responseTime += requestLog.responseTime;
      endpointsMap[url].totalInvocationCount += 1;
    });
    return {
      endpointRecordMap: endpointsMap,
      endpointRecords: Object.values(endpointsMap),
    };
  }

  async saveRequestLogBatch(batch: RequestLog[], cb: Function) {
    logger.info(
      `RequestLogManager -> saveRequestLogBatch: ${JSON.stringify(batch)}`
    );

    const { endpointRecordMap, endpointRecords } =
      this.getEndpointsRecordsForBatch(batch);

    const endpointResp = await Promise.all(
      endpointRecords.map((record) =>
        this.endpointDAO.upsert(
          { url: record.url, microserviceId: record.microserviceId },
          {
            $inc: {
              totalResponseTime: record.responseTime,
              totalInvocationCount: record.totalInvocationCount,
            },
            $setOnInsert: {
              url: record.url,
              microserviceId: record.microserviceId,
            },
          }
        )
      )
    );

    logger.info(
      `RequestLogManager -> saveRequestLogBatch: endpoints records response ${JSON.stringify(
        endpointResp
      )}`
    );

    //map _id with the endpoints records presenr in current batch
    endpointResp.forEach((record) => (endpointRecordMap[record.url] = record));

    //transform API Log data within a batch to store in db
    const apiLogList = batch.map((requestLog) => ({
      endpointId: endpointRecordMap[requestLog.url]._id,
      ...requestLog,
    }));

    await this.apiLogDAO.insertMany(apiLogList);

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
