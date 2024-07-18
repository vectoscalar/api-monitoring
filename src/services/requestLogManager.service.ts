import Queue from "better-queue";
import { requestLogSchema } from "../joi-schema";
import { MongooseClient } from "../clients/mongoClient";
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
          filter: RequestLogManager.validateRequestLog,
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

    return {
      url: requestUrl,
      method: request.method,
      statusCode: reply.statusCode,
      errorMessage:
        (!isSuccessfull &&
          (reply.payload.message || reply.raw.statusMessage)) ||
        null,
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
    logger.trace(
      `RequestLogManager -> saveRequestLogBatch: ${JSON.stringify(batch)}`
    );

    const { endpointRecordMap, endpointRecords } =
      this.getEndpointsRecordsForBatch(batch);

    const session = await MongooseClient.connection?.startSession();

    try {
      session!.startTransaction();

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
            },
            {
              upsert: true,
              new: true,
              projection: { __v: 0 },
              setDefaultsOnInsert: true,
              session,
            }
          )
        )
      );

      logger.trace(
        `RequestLogManager -> saveRequestLogBatch: endpoints records response 
         ${JSON.stringify(endpointResp)}`
      );

      //map _id with the endpoints records presenr in current batch
      endpointResp.forEach(
        (record) => (endpointRecordMap[record.url] = record)
      );

      //transform API Log data within a batch to store in db
      const apiLogList = batch.map((requestLog) => ({
        endpointId: endpointRecordMap[requestLog.url]._id,
        ...requestLog,
      }));

      logger.trace(
        `RequestLogManager -> saveRequestLogBatch: apiLogList ${JSON.stringify(
          apiLogList
        )}`
      );

      await this.apiLogDAO.insertMany(apiLogList, { session });

      session?.commitTransaction();

      logger.trace("successfully inserted batch", apiLogList);
      cb();
    } catch (err) {
      logger.error(`RequestLogManager -> saveRequestLogBatch:Error`, err);
      cb(err);
    }
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
    this.requestLogQueue.push(requestLog);

    logger.trace(
      `RequestLogManager -> addRequestLog: log added to queue: ${JSON.stringify(
        requestLog
      )}`
    );
  }
}
