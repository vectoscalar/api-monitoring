import { ProjectDAO, OrganizationDAO, MicroserviceDAO } from "../dao";

import { logger } from "../common/services";

export class UserAccountService {
  private projectDAO: ProjectDAO;
  private organizationDAO: OrganizationDAO;
  private microserviceDAO: MicroserviceDAO;

  constructor() {
    this.projectDAO = new ProjectDAO();
    this.organizationDAO = new OrganizationDAO();
    this.microserviceDAO = new MicroserviceDAO();
  }

  async setAccountInfo(
    organizationName: string,
    gst: string,
    projectName: string,
    microserviceName: string
  ) {
    const org: any = await this.organizationDAO.upsertOrganization(
      organizationName,
      gst
    );
    logger.info("Organization created ", org);

    const project: any = await this.projectDAO.upsertProject(
      org.id,
      projectName
    );
    logger.info("Project created ", project);

    const microservice: any = await this.microserviceDAO.upsertMicroservice(
      project.id,
      microserviceName
    );
    logger.info("Microservice created ", microservice.id);

    return {
      organizationId: org.id,
      projectId: project.id,
      microserviceId: microservice.id,
    };
  }
}
