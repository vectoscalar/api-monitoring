import { v4 as uuidv4 } from "uuid";
import { RequestLogQueue, logger, requestLogQueue } from "../common/services";
import { userAccountService } from "./";
import { RequestLog } from "../../src/types";

class ProcessManagerService {
  private requestData: Map<string, any>;

  constructor() {
    this.requestData = new Map();
  }

  async processRequestLogForLambda(logObj: RequestLog) {
    await RequestLogQueue.validateRequestLog(logObj, (err:any) => {
      logger.info(
        `Plugin: Requestlog Validation Error occured: ${JSON.stringify(err)}`
      );
    });
    await requestLogQueue.saveRequestLogBatch([logObj], (err:any) => {
      logger.info(`Plugin: save metrics error : ${JSON.stringify(err)}`);
    });
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

  async onSendHandler(request: any, reply: any, payload: any) {
    let requestDataObj = this.requestData.get(request.apiMonitoringId);
    requestDataObj = { ...requestDataObj, payload };
    this.requestData.set(request.apiMonitoringId, requestDataObj);
  }

  getTransformedRequestLog(request: any, reply: any) {
    const requestDataObj = this.requestData.get(request.apiMonitoringId);

    const payload = requestDataObj.payload;

    if (!requestDataObj) {
      logger.error(
        `Request data missing for  ID: ${request.apiMonitoringId}] Request for ${request.method} ${request.url}`
      );
      throw new Error(
        `Request data missing for  ID: ${request.apiMonitoringId}] Request for ${request.method} ${request.url}`
      );
    }

    const { startTime, hrStartTime } = requestDataObj;

    // const hrEndTime = process.hrtime(hrStartTime);

    const endTime = new Date();
    const elapsedTime = endTime.getTime() - startTime.getTime();

    logger.info(
      `[Request ID: ${request.apiMonitoringId}] Request for ${request.method} ${
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
    const bodySize = payload ? Buffer.byteLength(payload, "utf8") : 0;
    const responseSize = (responseHeadersSize + bodySize) / 1024; // in KB
    const requestBodySize = request.body
      ? Buffer.byteLength(JSON.stringify(request.body), "utf8")
      : 0;

    const accountInfo = userAccountService.getAccountInfo();

    const successRegex = /^[23]\d+$/;
    const isSuccessfull = successRegex.test(reply.statusCode.toString());

    const errorDetails = !isSuccessfull
      ? JSON.stringify({
          message: payload?.message || reply.raw.statusMessage,
          payload,
        })
      : null;

    const logObj = {
      url: request.url,
      routerUrl: request.routerPath,
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
      errorDetails,
    };

    logger.info(
      `[Request ID: ${
        request.apiMonitoringId
      }] log transformed: ${JSON.stringify(logObj)}`
    );
    return logObj;
  }

  async onResponseHandler(
    request: any,
    reply: any,
    options: any = {}
  ): Promise<void> {
    const logObj = this.getTransformedRequestLog(request, reply);
    if (options.lambdaEnv) {
      await this.processRequestLogForLambda(logObj);
    } else {
      requestLogQueue.addRequestLog(logObj);
      this.requestData.delete(request.apiMonitoringId);
    }
  }
}

export const processManagerService = new ProcessManagerService();
