import { Types } from "mongoose";
import { APIMonitorMongooseClient } from "../../src/clients/mongoClient";
import { logger } from "../common/services";
import { APILogDAO, EndpointDAO } from "../dao";

import {
  AvergaResponseFilter,
  InvocationFilter,
  RequestLog,
} from "../types/index";

export class ApiLogService {
  private apiLogDAO: APILogDAO;
  private endpointDAO: EndpointDAO;

  constructor() {
    this.apiLogDAO = new APILogDAO();
    this.endpointDAO = new EndpointDAO();
  }

  async getLatestInvocations(
    endpointId: string,
    filter: InvocationFilter,
    limit: number,
    offset: number
  ) {
    let query: any = {};

    const { period, ipAddress } = filter;

    if (!endpointId) throw new Error("Endpoint ID must be provided");

    query.endpointId = endpointId;

    if (ipAddress) query.ipAddress = ipAddress;

    if (period) {
      const { startDate, endDate } = this.getPeriodDateRange(period);
      query.timestamp = { $gte: startDate, $lte: endDate };
    }

    const { invocations, totalCount } =
      await this.apiLogDAO.getLatestInvocations(query, limit, offset);

    return { invocations, totalCount };
  }

  private getPeriodDateRange(period: string): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "weekly":
        const startOfWeek = now.getDate() - now.getDay(); // Start of the current week (Sunday)
        startDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the current month
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1); // Start of the current year
        break;
      default:
        throw new Error("Invalid period filter");
    }

    return { startDate, endDate };
  }

  async getAverageResponseTime(
    endpointId: string,
    filter: AvergaResponseFilter
  ) {
    const { period } = filter;
    let query: any = {};

    if (!endpointId) throw new Error("Endpoint ID must be provided");

    query.endpointId = new Types.ObjectId(endpointId);

    if (period) {
      const { startDate, endDate } = this.getPeriodDateRange(period);
      query.timestamp = { $gte: startDate, $lte: endDate };
    }

    return await this.apiLogDAO.getAverageResponseTimeByFilters(query);
  }

  async getMinResponseTime(
    endpointId: string,
    timePeriod?: "daily" | "weekly" | "monthly" | "yearly"
  ) {
    let query: any = {
      endpointId: new Types.ObjectId(endpointId),
      isSuccessfull: true,
    };

    if (timePeriod) {
      const { startDate, endDate } = this.getPeriodDateRange(timePeriod);
      query.timestamp = { $gte: startDate, $lte: endDate };
    }

    return await this.apiLogDAO.getMinResponseTime(query);
  }

  async getMaxResponseTime(
    endpointId: string,
    timePeriod?: "daily" | "weekly" | "monthly" | "yearly"
  ) {
    let query: any = {
      endpointId: new Types.ObjectId(endpointId),
      isSuccessfull: true,
    };

    if (timePeriod) {
      const { startDate, endDate } = this.getPeriodDateRange(timePeriod);
      query.timestamp = { $gte: startDate, $lte: endDate };
    }

    return await this.apiLogDAO.getMaxResponseTime(query);
  }

  async saveRequestLog(record: RequestLog) {
    try {
      logger.trace(
        `APILogService -> saveRequestLog: ${JSON.stringify(record)}`
      );
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

      // console.log("savelog:: endpoint model", this.endpointDAO.model);
      // await this.endpointDAO.create(record);

      let endpointResp = await this.endpointDAO.updateOne(
        {
          url: record.routerUrl || record.url,
          microserviceId: record.microserviceId,
          method: record.method,
        },
        {
          $inc: {
            totalResponseTime: record.responseTime,
            totalInvocationCount: 1,
          },
          $set: {
            url: record.routerUrl || record.url,
            microserviceId: record.microserviceId,
            method: record.method,
            isRouteAvailable: record.routerUrl ? true : false,
          },
        },
        {
          upsert: true,
          projection: { __v: 0 },
        }
      );

      if (!endpointResp.upsertedId) {
        endpointResp = await this.endpointDAO.findOne({
          url: record.routerUrl || record.url,
          microserviceId: record.microserviceId,
          method: record.method,
        });
      }

      if (record.reqContext?.envType === "LAMBDA") {
        logger.trace("saveRequestlog :: context lambda");
        record.endTime = new Date().toISOString();

        record.responseTime =
          new Date(record.endTime).getTime() -
          new Date(record.startTime).getTime();
      }
      const modifiedRecord = {
        endpointId: endpointResp.upsertedId || endpointResp._id,
        ...record,
      };

      logger.trace("ApiLogService:: modified record: ", modifiedRecord);

      const apiLogResp = await this.apiLogDAO.create(modifiedRecord);

      logger.info(
        `ApiLogService -> saveRequestLog: log saved with id: ${apiLogResp._id}`
      );
    } catch (err: any) {
      logger.error(
        ` Plugin Error: RequestLogManager -> saveRequestLog:: err ${err.message}`
      );
      throw err;
    }
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
    let session: any;
    try {
      logger.trace(
        `RequestLogManager -> saveRequestLogBatch: ${JSON.stringify(batch)}`
      );

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

      if (!Array.isArray(batch)) {
        logger.trace("saveRequestLogBatch size 1");
        await this.saveRequestLog(batch);
        cb(null, batch);
        return;
      }

      /*for saving data in db directly when no serviceApiKey is passed */
      const { endpointRecordMap, endpointRecords } =
        this.getEndpointsRecordsForBatch(batch);

      session = await APIMonitorMongooseClient.connection?.startSession();
      if (!session) throw new Error("Failed to start session");

      await session.withTransaction(async () => {
        try {
          //Step 1 : update endpoints table, inc invocationCount of all invocked apis, and execution time
          const endpointResp = await Promise.all(
            endpointRecords.map(async (record) =>
              this.endpointDAO.upsert(
                {
                  url: record.url,
                  microserviceId: record.microserviceId,
                  method: record.method,
                },
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
          cb(null, batch);
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
    } finally {
      // await session.endSession();
    }
  }
}
