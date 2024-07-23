import { MongooseClient } from '../clients/mongoClient';
import { UserAccountService } from './';
import { logger } from '../common/services/index';

import { requestLogQueue } from './';

export class ApiMonitorInitializer {

  async init(mongoUrl: string, organizationName: string, projectName: string, microserviceName: string, logLevel: string, queueOptions: any) {
    try {
      requestLogQueue.init(queueOptions);

      logger.init(logLevel);

      await MongooseClient.init(mongoUrl);

      await new UserAccountService().setAccountInfo(
        organizationName,
        projectName,
        microserviceName
      );
    } catch (err: any) {
      logger.error('Initialization failed', err);
      throw err;
    }
  }

}

export const apiMonitorInitializer = new ApiMonitorInitializer()

