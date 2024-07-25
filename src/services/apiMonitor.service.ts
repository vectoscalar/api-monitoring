import { MongooseClient } from '../clients/mongoClient';
import { UserAccountService } from '.';
import { axiosClient, logger } from '../common/services/index';

import { requestLogQueue } from '.';

export class ApiMonitorService {

  async init(mongoUrl: string | undefined, organizationName: string | undefined, projectName: string | undefined, microserviceName: string | undefined, logLevel: string, serviceKey: string | undefined, queueOptions: any) {
    try {
      requestLogQueue.init(queueOptions);

      logger.init(logLevel);

      if (serviceKey) {

        const userAccountInfo = await axiosClient.get(
          'https://66a0bce27053166bcabc8e93.mockapi.io/api/v1/account/user',
          { 'api-key': serviceKey },
        )


        const { mongoUrl, organizationId, projectId, microserviceId } = userAccountInfo.data[0].data;

        if (!mongoUrl) {
          throw new Error('Database initialization failed. Please check the server logs for details.');
        }

        await MongooseClient.init(mongoUrl);
        delete userAccountInfo.data[0].data['mongoUrl'];

        if (!organizationId || !projectId || !microserviceId) {
          throw new Error('Initialization failed. Failed to fetch one or more required IDs: organizationId, projectId, or microserviceId from the server.');
        }

        UserAccountService.setProperties(userAccountInfo.data[0].data);
      } else if (organizationName && projectName && microserviceName) {

        if (!mongoUrl) {
          throw new Error('Database initialization failed. Mongo URL is missing or invalid.');
        }

        await MongooseClient.init(mongoUrl);
        
        await new UserAccountService().insertAccountInfo(
          organizationName,
          projectName,
          microserviceName
        );
      } else {
        throw new Error('Either serviceApiKey or all four - organizationName, projectName, microserviceName and mongoUrl - must be provided.');
      }


    } catch (err: any) {
      logger.error('Initialization failed', err);
      throw err;
    }
  }

}

export const apiMonitorService = new ApiMonitorService()

