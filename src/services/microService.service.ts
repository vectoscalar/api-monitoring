import { MicroserviceDAO} from '../dao';
import { BaseService } from '../common/services/index';

export class MicroServiceService extends BaseService {
  private microserviceDAO: MicroserviceDAO;

  constructor() {
    super();
    this.microserviceDAO = new MicroserviceDAO();
  }

  /**
   * Method to retrieve the microservice of a projectId.
   * @param projectId 
   * @returns 
   */
  async getMicroServices(projectId: string) {
    return this.microserviceDAO.getAllMicroservicesByProjectId(projectId);
  }

}
