import Queue from "better-queue";
import { requestLogSchema } from "../../joi-schema";
import { APIMonitorMongooseClient } from "../../clients/mongoClient";
import { logger, axiosClient } from "../services";
import { RequestLog } from "../../types";
import { APILogDAO, EndpointDAO } from "../../dao";
// import { userAccountService } from "../services";
import {
  BASE_URL_SAAS,
  ENDPOINT_LOGS_ROUTE,
  ORGANIZATIONS_ROUTE,
  PROJECTS_ROUTE,
} from "../../common/constant";

export class RequestLogQueue {
  private static instance: RequestLogQueue | null = null;
  private requestLogQueue: Queue | null;
  private queueOptions: Partial<Queue.QueueOptions<any, any>> | null;
  private endpointDAO: EndpointDAO;
  private apiLogDAO: APILogDAO;

  constructor() {
    this.queueOptions = null;
    this.endpointDAO = new EndpointDAO();
    this.apiLogDAO = new APILogDAO();
    this.requestLogQueue = null;
  }

  init({ queueOptions, lambdaEnv }: any) {
    this.queueOptions = queueOptions;

    const { batchSize, batchDelay, batchDelayTimeout } = queueOptions;

    const mergedQueueOptions = Object.assign(
      {},
      { batchSize, batchDelay, batchDelayTimeout },
      queueOptions
    );

    this.requestLogQueue = new Queue(
      this.saveRequestLogBatch.bind(this),
      mergedQueueOptions
    );
  }

  getEndpointsRecordsForBatch(batch: RequestLog[]) {
    const endpointsMap: { [key: string]: any } = {};
    batch.forEach((requestLog) => {
      const url = requestLog.routerUrl || requestLog.url;
      const key = `${url}#${requestLog.method}`;

      if (!endpointsMap.hasOwnProperty(url)) {
        endpointsMap[key] = {
          url,
          method: requestLog.method,
          responseTime: 0,
          totalInvocationCount: 0,
          microserviceId: requestLog.microserviceId,
          isRouteAvailable: requestLog.routerUrl ? true : false,
        };
      }
      endpointsMap[key].responseTime += requestLog.responseTime;
      endpointsMap[key].totalInvocationCount += 1;
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

    if (!Array.isArray(batch) && this.queueOptions?.batchSize === 1) {
      batch = [batch];
    }

    try {
      // NOTE: commented below code for internal use only
      // metrics are saved by making axios call but commented to save cost for
      // if (userAccountService.getProperties().serviceKey) {
      //   const { organizationId, projectId, microserviceId, serviceKey } =
      //     userAccountService.getProperties();
      //   const url =
      //     BASE_URL_SAAS +
      //     `${ORGANIZATIONS_ROUTE}/${organizationId}${PROJECTS_ROUTE}/${projectId}${ENDPOINT_LOGS_ROUTE}`;
      //   const headers = { apiKey: serviceKey };
      //   await axiosClient.post(url, batch, headers);

      //   logger.trace("successfully inserted batch");
      // }

      /*for saving data in db directly when no serviceApiKey is passed */
      const { endpointRecordMap, endpointRecords } =
        this.getEndpointsRecordsForBatch(batch);

      const session = await APIMonitorMongooseClient.connection?.startSession();
      if (!session) throw new Error("Failed to start session");

      session.withTransaction(async () => {
        try {
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
                    method: record.method,
                    isRouteAvailable: record.isRouteAvailable,
                  },
                },
                {
                  upsert: true,
                  new: true,
                  projection: { __v: 0 },
                  setDefaultsOnInsert: true,
                }
              )
            )
          );

          logger.trace(
            `RequestLogManager -> saveRequestLogBatch: endpoints records response 
             ${JSON.stringify(endpointResp)}`
          );

          //map _id with the endpoints records presenr in current batch
          endpointResp.forEach((record) => {
            endpointRecordMap[`${record.url}#${record.method}`] = record;
          });

          //transform API Log data within a batch to store in db
          const apiLogList = batch.map((requestLog) => ({
            endpointId:
              endpointRecordMap[
                `${requestLog.routerUrl || requestLog.url}#${requestLog.method}`
              ]._id,
            ...requestLog,
          }));

          logger.trace(
            `RequestLogManager -> saveRequestLogBatch: apiLogList ${JSON.stringify(
              apiLogList
            )}`
          );

          await this.apiLogDAO.insertMany(apiLogList);

          logger.trace("successfully inserted batch", apiLogList);
        } catch (err) {
          logger.error(` Plugin Error: RequestLogManager -> save metrcis`, err);
          cb(err);
        }
      });
    } catch (err: any) {
      logger.error(
        ` Plugin Error: RequestLogManager -> saveRequestLogBatch`,
        err
      );
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
    this.requestLogQueue?.push(requestLog);

    logger.trace(
      `RequestLogManager -> addRequestLog: log added to queue: ${JSON.stringify(
        requestLog
      )}`
    );
  }
}

export const requestLogQueue = new RequestLogQueue();
