import { MongooseClient } from '../clients/mongoClient';
import { UserAccountService } from '.';
import { logger } from '../common/services/index';

import { requestLogQueue } from '.';

export class ApiMonitorService {

  async init(mongoUrl: string, organizationName: string | undefined, projectName: string | undefined, microserviceName: string | undefined, logLevel: string, serviceKey: string | undefined, queueOptions: any) {
    try {
      requestLogQueue.init(queueOptions);

      logger.init(logLevel);

      if(process.env.mongoUrl) {
        await MongooseClient.init(process.env.mongoUrl);
      } else {
        throw new Error('Database initialization failed. Please check the server logs for details.');
      }

      if(serviceKey) {
        await new UserAccountService().setAccountInfo(serviceKey);

      } else if(organizationName && projectName && microserviceName) {
        await new UserAccountService().insertAccountInfo(
          organizationName,
          projectName,
          microserviceName
        );
      } else {
        throw new Error('Either serviceApiKey or all three - organizationName, projectName, and microserviceName - must be provided.');
      }


    } catch (err: any) {
      logger.error('Initialization failed', err);
      throw err;
    }
  }

}

export const apiMonitorService = new ApiMonitorService()

