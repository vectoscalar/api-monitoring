import { v4 as uuidv4 } from "uuid";
import { logger, requestLogQueue } from "../common/services";
import { userAccountService } from "./";

class ProcessManagerService {
  private requestData: Map<string, any>;

  constructor() {
    this.requestData = new Map();
  }

  async onRequestHandler(request: any) {
    request.apiMonitoringId = uuidv4();
    logger.info(
      `[Request ID: ${request.apiMonitoringId}] Request for ${request.method} ${request.url} `
    );
    const startTime = new Date();
    const hrStartTime = process.hrtime();

    this.requestData.set(request.apiMonitoringId, { startTime, hrStartTime });
    logger.info(
      `[Request ID: ${request.apiMonitoringId}] Request for ${request.method} ${
        request.url
      } started at: ${startTime.toISOString()}`
    );
  }

  onSendHandler(request: any, reply: any, payload: any) {
    let requestDataObj = this.requestData.get(request.apiMonitoringId);

    reply.payload = payload;

    requestDataObj = { ...requestDataObj, payload };
    this.requestData.set(request.apiMonitoringId, requestDataObj);
  }

  onResponseHandler(request: any, reply: any): void {
    const requestDataObj = this.requestData.get(request.apiMonitoringId);

    if (requestDataObj) {
      const { startTime, hrStartTime } = requestDataObj;

      // const hrEndTime = process.hrtime(hrStartTime);

      const endTime = new Date();
      const elapsedTime = endTime.getTime() - startTime.getTime();

      const payload = reply.payload;

      logger.info(
        `[Request ID: ${request.apiMonitoringId}] Request for ${
          request.method
        } ${
          request.url
        } started at: ${startTime.toISOString()}, ended at: ${endTime.toISOString()}, Elapsed time: ${elapsedTime.toFixed(
          2
        )} ms`
      );

      const headersSize = Buffer.byteLength(
        JSON.stringify(request.headers),
        "utf8"
      );
      const responseHeadersSize = Buffer.byteLength(
        JSON.stringify(reply.getHeaders()),
        "utf8"
      );
      const bodySize = Buffer.byteLength(JSON.stringify(payload), "utf8");
      const responseSize = (responseHeadersSize + bodySize) / 1024; // in KB
      const requestBodySize = request.body
        ? Buffer.byteLength(JSON.stringify(request.body), "utf8")
        : 0;

      const accountInfo = userAccountService.getAccountInfo();

      const successRegex = /^[23]\d+$/;
      const isSuccessfull = successRegex.test(reply.statusCode.toString());

      const errorMessage =
        (!isSuccessfull && (payload?.message || reply.raw.statusMessage)) ||
        null;

      const logObj = {
        url: request.url,
        routerPath: request.routerPath,
        method: request.method,
        statusCode: reply.statusCode,
        organizationId: accountInfo.organizationId,
        projectId: accountInfo.projectId,
        microserviceId: accountInfo.microserviceId,
        isSuccessfull,
        responseTime: elapsedTime,
        ipAddress: request.ip,
        startTime,
        endTime,
        elapsedTime,
        requestHeaderSize: headersSize,
        requestBodySize,
        responseSize,
        responseBody: payload,
      };
      logger.info(
        `[Request ID: ${
          request.apiMonitoringId
        }] log transformed: ${JSON.stringify(logObj)}`
      );

      requestLogQueue.addRequestLog(logObj);

      this.requestData.delete(request.apiMonitoringId);
    }
  }
}

export const processManagerService = new ProcessManagerService();
