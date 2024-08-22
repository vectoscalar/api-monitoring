import { userAccountService } from "./index";
import { EndpointDAO } from "../dao";

export class EndpointService {
  private endpointDAO: EndpointDAO;

  constructor() {
    this.endpointDAO = new EndpointDAO();
  }

  /**
   * Method to retrieve list of endpoints of a microserviceId.
   * @param microServiceId
   * @returns
   */
  async getALLEndpointsByMicroserviceId() {
    return this.endpointDAO.getALLEndpointsByMicroserviceId(
      userAccountService.getAccountInfo().microserviceId
    );
  }
}
