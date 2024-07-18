import { ProjectDAO } from '../dao';

export class ProjectService {
  private projectDAO: ProjectDAO;

  constructor() {
    this.projectDAO = new ProjectDAO();
  }

}
