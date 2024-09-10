import { v4 as uuidv4 } from "uuid";
import { logger } from "./";
import { UserAccountService } from "../../services/userAccount.service";

export abstract class RequestProcessorService {
  protected requestData: Map<string, any>;
  protected apiLogDAO: any;
  protected endpointDAO: any;

  constructor() {
    this.requestData = new Map();
  }

  async onRequestHandler(request: any) {
    try {
      logger.trace("RequestProcessorService:: onRequestHandler");
      request.apiMonitoringId = uuidv4();
      const startTime = new Date();
      const hrStartTime = process.hrtime();

      logger.trace(
        `RequestProcessorService:: [Request ID: ${
          request.apiMonitoringId
        }] Request for ${request.method} ${
          request.url
        } started at: ${startTime.toISOString()}`
      );

      this.requestData.set(request.apiMonitoringId, { startTime, hrStartTime });
    } catch (err) {
      logger.error(
        `RequestProcessorService:: onRequestHandler :: error :: ${JSON.stringify(
          err
        )}`
      );
      throw err;
    }
  }

  async onSendHandler(request: any, reply: any, payload: any) {
    let requestDataObj = this.requestData.get(request.apiMonitoringId);
    requestDataObj = { ...requestDataObj, payload };
    this.requestData.set(request.apiMonitoringId, requestDataObj);
  }

  onResponseHandler(request: any, reply: any) {}

  getTransformedRequestLog(
    request: any,
    reply: any,
    envType: "LAMBDA" | "EC2"
  ) {
    const requestId =
      envType === "LAMBDA"
        ? request.awsLambda.event.requestContext.awsRequestId
        : request.apiMonitoringId;

    const requestDataObj = this.requestData.get(requestId);

    const payload = requestDataObj.payload;

    if (!requestDataObj) {
      logger.error(
        `RequestProcessorService::getTransformedRequestLog :: Request data missing for  ID: ${request.apiMonitoringId}] Request for ${request.method} ${request.url}`
      );
      throw new Error(
        `RequestProcessorService::getTransformedRequestLog :: Request data missing for  ID: ${request.apiMonitoringId}] Request for ${request.method} ${request.url}`
      );
    }

    const { startTime } = requestDataObj;

    const endTime =
      envType === "LAMBDA"
        ? new Date()
        : new Date(startTime.getTime() + reply.elapsedTime);

    const elapsedTime = endTime.getTime() - startTime.getTime();

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

    const accountInfo = UserAccountService.getAccountInfo();

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

    logger.trace(
      `RequestProcessorService::getTransformedRequestLog :: [Request ID: ${
        request.apiMonitoringId
      }] log transformed: ${JSON.stringify(logObj)}`
    );
    return logObj;
  }
}