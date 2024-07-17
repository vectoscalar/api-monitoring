import { ObjectId } from 'mongodb';
import { EndpointDAO } from '../dao';
import { BaseService } from '../common/services/index';

export class EndpointService extends BaseService {
  private endpointDAO: EndpointDAO;

  constructor() {
    super();
    this.endpointDAO = new EndpointDAO();
  }

  /**
   * Method to retrieve list of endpoints of a microserviceId.
   * @param microServiceId 
   * @returns 
   */
  async getALLEndpointsByMicroserviceId(microServiceId: string) {
    return this.endpointDAO.getALLEndpointsByMicroserviceId(microServiceId);
  }

}
