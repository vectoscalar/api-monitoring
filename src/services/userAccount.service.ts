import { ProjectDAO, OrganizationDAO, MicroserviceDAO } from "../dao";

import { logger } from "../common/services";

export class UserAccountService {
  private projectDAO: ProjectDAO;
  private organizationDAO: OrganizationDAO;
  private microserviceDAO: MicroserviceDAO;

  static organizationId: string;
  static projectId: string;
  static microserviceId: string;
  static serviceKey: string;
  static useLocal: boolean;

  static setProperties(properties: { organizationId: string, projectId: string, microserviceId: string }, serviceKey: string, useLocal) {
    UserAccountService.organizationId = properties.organizationId;
    UserAccountService.projectId = properties.projectId;
    UserAccountService.microserviceId = properties.microserviceId;
    UserAccountService.serviceKey = serviceKey;
    UserAccountService.useLocal = useLocal;
  }

  static getProperties() {
    return {
      organizationId: UserAccountService.organizationId,
      projectId: UserAccountService.projectId,
      microserviceId: UserAccountService.microserviceId,
      serviceKey: UserAccountService.serviceKey
    };
  }

  constructor() {
    this.projectDAO = new ProjectDAO();
    this.organizationDAO = new OrganizationDAO();
    this.microserviceDAO = new MicroserviceDAO();
  }

  async setAccountInfo(
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

    const microservice: any = await this.microserviceDAO.upsertMicroservice(project.id, microserviceName);
    logger.trace('Microservice created ', microservice);

    UserAccountService.organizationId = org.id;
    UserAccountService.microserviceId = microservice._id.toString();
    UserAccountService.projectId = project.id;

    return { organizationId: org.id, projectId: project.id, microserviceId: microservice.id }
  }

}
