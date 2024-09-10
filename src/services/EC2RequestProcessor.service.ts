import { RequestLogQueue, logger } from "../common/services";
import { RequestProcessorService } from "../common/services/requestProcessorService";

export class EC2RequestProcessorService extends RequestProcessorService {
  constructor() {
    super();
  }

  async onSendHandler(request: any, reply: any, payload: any): Promise<void> {
    setImmediate(async () => {
      try {
        logger.trace("EC2RequestProcessorService:: onSendHandler");
        super.onSendHandler(request, reply, payload);
      } catch (err) {
        logger.trace(
          `EC2RequestProcessorService:: onSendHandler error: ${JSON.stringify(
            err
          )}`
        );
      }
    });
  }

  async onResponseHandler(
    request: any,
    reply: any,
    options: any = {}
  ): Promise<void> {
    setImmediate(async () => {
      try {
        logger.trace("EC2RequestProcessorService:: onResponseHandler");

        const logObj = this.getTransformedRequestLog(request, reply, "EC2");

        RequestLogQueue.getInstance()!.addRequestLog(logObj);

        this.requestData.delete(request.apiMonitoringId);
      } catch (err) {
        logger.trace(
          `EC2RequestProcessorService:: onResponseHandler error: ${JSON.stringify(
            err
          )}`
        );
      }
    });
  }
}
