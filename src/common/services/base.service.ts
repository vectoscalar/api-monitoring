export class BaseService {
  static organizationId: string;
  static projectId: string;
  static microserviceId: string;

  constructor(){}

  static setProperties(properties: { organizationId: string, projectId: string, microserviceId: string }) {
    BaseService.organizationId = properties.organizationId;
    BaseService.projectId = properties.projectId;
    BaseService.microserviceId = properties.microserviceId;
   }

  static getProperties() {
    return {
      organizationId: BaseService.organizationId,
      projectId: BaseService.projectId,
      microserviceId: BaseService.microserviceId,
    };
  }
}
