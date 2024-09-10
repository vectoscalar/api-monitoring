import { v4 as uuidv4 } from "uuid";
import { RequestProcessorService } from "../common/services/requestProcessorService";
import { ApiLogService } from "./apiLog.service";
import { logger } from "../common/services";
import { APIMonitorMongooseClient } from "../../src/clients/mongoClient";

export class LambdaRequestProcessorService extends RequestProcessorService {
  apiLogService: ApiLogService;

  constructor() {
    super();
    this.apiLogService = new ApiLogService();
  }

  async onRequestHandler(request: any): Promise<void> {
    try {
      const startTime = new Date(
        request.awsLambda.event.requestContext.timeEpoch
      );

      logger.trace(
        `LambdaRequestProcessorService:: [Request ID: ${
          request.awsLambda.event.requestContext.awsRequestId
        }] Request for ${request.method} ${
          request.url
        } started at: ${startTime.toISOString()}`
      );
    } catch (err) {
      logger.error(
        `LambdaRequestProcessorService:: onRequestHandler :: error :: ${JSON.stringify(
          err
        )}`
      );
      throw err;
    }
  }

  async onSendHandler(request: any, reply: any, payload: any) {
    try {
      logger.trace("LambdaRequestProcessorService -> onSendHandler");

      const requestId = request.awsLambda.event.requestContext.awsRequestId;

      const startTime = new Date(
        request.awsLambda.event.requestContext.timeEpoch
      );

      this.requestData.set(requestId, { requestId, startTime });

      const logObj = this.getTransformedRequestLog(request, reply, "LAMBDA");

      await this.apiLogService.saveRequestLog(logObj);

      this.requestData.delete(requestId);
      logger.trace("LambdaRequestProcessorService -> onSendHandler completed");
    } catch (err) {
      logger.error(
        `LambdaRequestProcessorService -> onSendHandler error: ${JSON.stringify(
          err
        )}`
      );
    }
  }
}
