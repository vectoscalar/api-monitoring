import { FastifyInstance, FastifyReply, FastifyRequest, preSerializationHookHandler } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../common/services';
import { requestLogQueue, UserAccountService } from './';



class ProcessManagerService {
  private requestData: Map<string, any>;

  constructor() {
    this.requestData = new Map();
  }

  onRequestHander(request: any) {
    setImmediate(async () => {
      request.apiMonitoringId = uuidv4();

      const startTime = new Date();
      const hrStartTime = process.hrtime();

      this.requestData.set(request.apiMonitoringId, { startTime, hrStartTime });
      logger.info(`[Request ID: ${request.apiMonitoringId}] Request for ${request.method} ${request.url} started at: ${startTime.toISOString()}`);
    })
  }

  onSendHandler(request: any, reply: any, payload: any) {

    setImmediate(async () => {
      let requestDataObj = this.requestData.get(request.apiMonitoringId);

      reply.payload = payload;

      requestDataObj = { ...requestDataObj, payload }
      this.requestData.set(request.apiMonitoringId, requestDataObj)
    })
  }


  onResponseHandler(request: any, reply: any): void {
    setImmediate(async () => {
      const requestDataObj = this.requestData.get(request.apiMonitoringId);

      if (requestDataObj) {
        const { startTime, hrStartTime } = requestDataObj;

        const hrEndTime = process.hrtime(hrStartTime);
        const elapsedTime = (hrEndTime[0] * 1e9 + hrEndTime[1]) / 1e6;
        const endTime = new Date(startTime.getTime() + elapsedTime);

        const payload = reply.payload;

        logger.info(
          `[Request ID: ${request.apiMonitoringId}] Request for ${request.method} ${request.url} started at: ${startTime.toISOString()}, ended at: ${endTime.toISOString()}, Elapsed time: ${elapsedTime.toFixed(2)} ms`
        );

        const headersSize = Buffer.byteLength(JSON.stringify(request.headers), 'utf8');
        const responseHeadersSize = Buffer.byteLength(JSON.stringify(reply.getHeaders()), 'utf8');
        const bodySize = Buffer.byteLength(JSON.stringify(payload), 'utf8');
        const responseSize = (responseHeadersSize + bodySize) / 1024; // in KB
        const requestBodySize = request.body ? Buffer.byteLength(JSON.stringify(request.body), 'utf8') : 0;

        const accountInfo = UserAccountService.getProperties();

        const successRegex = /^[23]\d+$/;
        const isSuccessfull = successRegex.test(reply.statusCode.toString());

        const errorMessage = !isSuccessfull && (payload?.message || reply.raw.statusMessage) || null;

        const requestUrl = request.url;
        const logObj = {
          url: requestUrl,
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
          ...(isSuccessfull ? {} : { responseBody: payload })
        };

        logger.info(`[Request ID: ${request.apiMonitoringId}] Processed log: ${JSON.stringify(logObj)}`);

        this.requestData.delete(request.apiMonitoringId);

        requestLogQueue.addRequestLog(logObj)
      }
    })
  }

}

export const processManagerService = new ProcessManagerService();
