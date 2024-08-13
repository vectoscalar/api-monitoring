import { MongooseClient } from '../clients/mongoClient';
import { UserAccountService } from '.';
import { axiosClient, logger } from '../common/services/index';

import { requestLogQueue } from '.';
import { BASE_URL_SAAS, USER_ACCOUNT_INFO_ENDPOINT } from '../common/constant';

export class ApiMonitorService {

  async init(mongoUrl: string | undefined, organizationName: string | undefined, projectName: string | undefined, microserviceName: string | undefined, logLevel: string, serviceKey: string | undefined, queueOptions: any, useLocal: boolean | undefined) {
    try {
      requestLogQueue.init(queueOptions);

      logger.init(logLevel);

      if (serviceKey) {

        const userAccountInfo = await axiosClient.get(
          BASE_URL_SAAS + USER_ACCOUNT_INFO_ENDPOINT,
          { 'apikey': serviceKey },
        )

        const { organizationId, projectId, microserviceId } = userAccountInfo.data.data;

        if (!organizationId || !projectId || !microserviceId) {
          logger.error('Plugin initialization failed. Failed to fetch one or more required IDs: organizationId, projectId, or microserviceId from the server.')
          throw new Error('Plugin initialization failed. Failed to fetch one or more required IDs: organizationId, projectId, or microserviceId from the server.');
        }

        UserAccountService.setProperties(userAccountInfo.data.data, serviceKey, useLocal);
      } else if (organizationName && projectName && microserviceName) {

        if (!mongoUrl) {
          throw new Error('Plugin initialization failed. Mongo URL is missing.');
        }

        await MongooseClient.init(mongoUrl);

        await new UserAccountService().setAccountInfo(
          organizationName,
          projectName,
          microserviceName
        );
      } else {
        throw new Error('Plugin Initialization failed. Either serviceApiKey or all four - organizationName, projectName, microserviceName and mongoUrl - must be provided.');
      }


    } catch (err: any) {
      if(err.name && err.name === 'AxiosError') {
        throw new Error('Service key not found or invalid. Please ensure the provided service key is correct.')
      }

      logger.error('Plugin initialization failed', err);
      throw err;
    }

    logger.trace('Plugin has been successfully initialized.')
  }

}

export const apiMonitorService = new ApiMonitorService()

