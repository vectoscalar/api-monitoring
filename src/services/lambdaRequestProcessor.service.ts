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

  async onSendHandler(request: any, reply: any, payload: any, done) {
    try {
      const requestId = request.awsLambda.event.requestContext.requestId;

      logger.trace(
        `LambdaRequestProcessorService -> onSendHandler requestId:: ${requestId}`
      );

      const startTime = new Date(
        request.awsLambda.event.requestContext.timeEpoch
      );

      const requestData = this.requestData.get(requestId);

      if (requestData) {
        logger.trace(
          `LambdaRequestProcessorService -> onSendHandler invoked again found request data `
        );
        return;
      }

      this.requestData.set(requestId, { requestId, startTime, payload });

      const logObj = this.getTransformedRequestLog(request, reply, "LAMBDA");

      logger.trace(
        `LambdaRequestProcessorService -> onSendHandler requestId:: ${requestId} -> logObj:: ${JSON.stringify(
          logObj
        )}`
      );

      await this.apiLogService.saveRequestLog(logObj);

      this.requestData.set(requestId, {});
      logger.trace(
        `LambdaRequestProcessorService -> onSendHandler completed requestId:: ${requestId}`
      );
      done(null, payload);
    } catch (err) {
      logger.error(
        `LambdaRequestProcessorService -> onSendHandler error: ${JSON.stringify(
          err
        )}`
      );
      done(err);
    }
  }
}
