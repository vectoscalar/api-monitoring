import { ProjectDAO, OrganizationDAO, MicroserviceDAO } from "../dao";
import { APIMonitorMongooseClient } from "../clients/mongoClient";
import { axiosClient } from "../common/services";
import {
  BASE_URL_SAAS,
  USER_ACCOUNT_INFO_ENDPOINT,
  DEFAULT_MONGO_URL,
  ENV_TYPE,
} from "../common/constant";
import { logger } from "../common/services";
import { SystemMetrics } from "./systemMetrics.service";

export class UserAccountService {
  private static instance: UserAccountService | null = null;
  private projectDAO: ProjectDAO;
  private organizationDAO: OrganizationDAO;
  private microserviceDAO: MicroserviceDAO;

  static organizationId: string;
  static projectId: string;
  static microserviceId: string;
  static serviceKey: string;
  static mongoUrl: string;

  private constructor() {
    this.projectDAO = new ProjectDAO();
    this.organizationDAO = new OrganizationDAO();
    this.microserviceDAO = new MicroserviceDAO();
  }

  static getInstance() {
    if (!UserAccountService.instance) {
      this.instance = new UserAccountService();
    }
    return this.instance;
  }

  static getAccountInfo() {
    return {
      organizationId: UserAccountService.organizationId,
      projectId: UserAccountService.projectId,
      microserviceId: UserAccountService.microserviceId,
      serviceKey: UserAccountService.serviceKey,
      mongoUrl: UserAccountService.mongoUrl,
    };
  }

  static setAccountInfo(data: {
    organizationId: string;
    projectId: string;
    microserviceId: string;
    serviceApiKey: string;
  }) {
    UserAccountService.organizationId = data.organizationId;
    UserAccountService.projectId = data.projectId;
    UserAccountService.microserviceId = data.microserviceId;
    UserAccountService.serviceKey = data.serviceApiKey;
  }

  async setupUserAccountInfo({ envType, accountInfo, serviceApiKey, provider }) {
    let serviceInfo: any;
    if (
      accountInfo &&
      accountInfo.organizationName &&
      accountInfo.projectName &&
      accountInfo.microserviceName
    ) {
      serviceInfo = await this.createUserAccount(
        accountInfo.organizationName,
        accountInfo.projectName,
        accountInfo.microserviceName,
        envType
      );
    } else if (serviceApiKey) {
      //NOTE for Internal use only remove this  for external use
      const microServiceInfo =
        await this.microserviceDAO.getMicroserviceDetailsByApiKey(
          serviceApiKey
        );

      if (microServiceInfo[0] && !microServiceInfo[0].envType) {
        //update enev for microservice
        logger.info(
          `microservice exist by service api key: ${serviceApiKey} but environment not found`
        );

        await this.microserviceDAO.update(microServiceInfo[0]._id, {
          envType,
        });

        logger.info(
          `for microservice: ${serviceApiKey} envType: ${envType} updated`
        );
      }
      serviceInfo = microServiceInfo[0] || {};
    }
    const { organizationId, projectId, microserviceId } = serviceInfo;

    if (!organizationId || !projectId || !microserviceId) {
      logger.error(
        "Initialization failed. Failed to fetch one or more required IDs: organizationId, projectId, or microserviceId from the server."
      );
      throw new Error(
        "Initialization failed. Failed to fetch one or more required IDs: organizationId, projectId, or microserviceId from the server."
      );
    }

    UserAccountService.setAccountInfo({
      organizationId,
      projectId,
      microserviceId,
      serviceApiKey,
    });

    logger.trace(
      `UserAccount init completed: ${JSON.stringify(
        UserAccountService.getAccountInfo()
      )}`
    );
          
    if(envType !== ENV_TYPE.SERVERLESS) {
      if(!provider) {
        throw new Error('Provider was not provided in plugin options.')
      }
      new SystemMetrics().startMonitoring(provider)
    }
    
  }

  async createUserAccount(
    organizationName: string,
    projectName: string,
    microserviceName: string,
    envType: string
  ) {
    const org: any = await this.organizationDAO.upsertOrganization(
      organizationName
    );
    logger.trace(" Organization created ", org);

    const project: any = await this.projectDAO.upsertProject(
      org.id,
      projectName
    );
    logger.trace("Project created ", project);

    const microservice: any = await this.microserviceDAO.upsertMicroservice(
      project.id,
      microserviceName,
      envType
    );
    logger.trace("Microservice created ", microservice);

    return {
      organizationId: org.id,
      projectId: project.id,
      microserviceId: microservice._id.toString(),
    };
  }
}
