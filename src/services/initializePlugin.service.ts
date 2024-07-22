import { MongooseClient } from '../clients/mongoClient';
import { UserAccountService } from './';
import { logger } from '../common/services/index';

export class InitializePlugin {
  private mongoUrl: string;
  private organizationName: string;
  private projectName: string;
  private microserviceName: string;
  private logLevel: string;

  constructor(mongoUrl: string, organizationName: string, projectName: string, microserviceName: string, logLevel: string) {
    this.mongoUrl = mongoUrl;
    this.organizationName = organizationName;
    this.projectName = projectName;
    this.microserviceName = microserviceName;
    this.logLevel = logLevel;
  }

  async init() {
    try {
      logger.init(this.logLevel);
      await MongooseClient.init(this.mongoUrl);
      const { organizationId, projectId, microserviceId } = await new UserAccountService().setAccountInfo(
        this.organizationName,
        this.projectName,
        this.microserviceName
      );

      return { organizationId, projectId, microserviceId }

    } catch (err: any) {
      logger.error('Initialization failed', err);
      throw err;
    }
  }

}

