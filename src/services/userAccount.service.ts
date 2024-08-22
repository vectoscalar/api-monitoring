import { ProjectDAO, OrganizationDAO, MicroserviceDAO } from "../dao";
import { MongooseClient } from "../clients/mongoClient";
import { axiosClient } from "../common/services";
import { BASE_URL_SAAS, USER_ACCOUNT_INFO_ENDPOINT } from "../common/constant";
import { logger } from "../common/services";

class UserAccountService {
  private projectDAO: ProjectDAO;
  private organizationDAO: OrganizationDAO;
  private microserviceDAO: MicroserviceDAO;

  static organizationId: string;
  static projectId: string;
  static microserviceId: string;
  static serviceKey: string;
  static mongoUrl: string;

  constructor() {
    this.projectDAO = new ProjectDAO();
    this.organizationDAO = new OrganizationDAO();
    this.microserviceDAO = new MicroserviceDAO();
  }

  getAccountInfo() {
    return {
      organizationId: UserAccountService.organizationId,
      projectId: UserAccountService.projectId,
      microserviceId: UserAccountService.microserviceId,
      serviceKey: UserAccountService.serviceKey,
      mongoUrl: UserAccountService.mongoUrl,
    };
  }

  async createUserAccount(
    organizationName: string,
    projectName: string,
    microserviceName: string
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
      microserviceName
    );
    logger.trace("Microservice created ", microservice);

    return {
      organizationId: org.id,
      projectId: project.id,
      microserviceId: microservice._id.toString(),
    };
  }

  async init({ serviceApiKey, accountInfo }: any) {
    try {
      if (!serviceApiKey && !(accountInfo || accountInfo.mongoUrl)) {
        throw new Error("pls provide either service api key or account info");
      }

      let organizationId: null | string = null;
      let projectId: null | string = null;
      let microserviceId: null | string = null;
      let mongoUrl: null | string = null;

      if (serviceApiKey) {
        const userAccountInfo = await axiosClient.get(
          BASE_URL_SAAS + USER_ACCOUNT_INFO_ENDPOINT,
          { apikey: serviceApiKey }
        );

        ({
          organizationId,
          projectId,
          microserviceId,
          mongoUrl = accountInfo.mongoUrl,
        } = userAccountInfo.data.data);
        await MongooseClient.init(mongoUrl!);
      } else {
        const { organizationName, projectName, microserviceName } = accountInfo;
        mongoUrl = accountInfo.mongoUrl;

        await MongooseClient.init(mongoUrl!);

        ({ organizationId, projectId, microserviceId } =
          await this.createUserAccount(
            organizationName,
            projectName,
            microserviceName
          ));
      }

      if (!organizationId || !projectId || !microserviceId || !mongoUrl) {
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
        mongoUrl,
        serviceApiKey,
      });

      logger.trace(
        `UserAccount init completed: ${JSON.stringify(this.getAccountInfo())}`
      );
    } catch (err: any) {
      logger.error("Initialization failed", err);
      throw err;
    }
  }

  static setAccountInfo(data: {
    mongoUrl: string;
    organizationId: string;
    projectId: string;
    microserviceId: string;
    serviceApiKey: string;
  }) {
    UserAccountService.organizationId = data.organizationId;
    UserAccountService.projectId = data.projectId;
    UserAccountService.microserviceId = data.microserviceId;
    UserAccountService.serviceKey = data.serviceApiKey;
    UserAccountService.mongoUrl = data.mongoUrl;
  }
}

export const userAccountService = new UserAccountService();
