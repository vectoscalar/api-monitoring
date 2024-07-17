import { ProjectDAO } from '../dao';
import { BaseService } from '../common/services/index';

export class ProjectService extends BaseService {
  private projectDAO: ProjectDAO;

  constructor() {
    super();
    this.projectDAO = new ProjectDAO();
  }

  /**
   * Get project list.
   * -- For now we are getting project list based on config provided organizationId.
   * @returns 
   */
  async getProjectList() {
    return this.projectDAO.getAllProjectByOrganizationId(ProjectService.organizationId);
  }

}
