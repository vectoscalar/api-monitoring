import { MicroserviceDAO} from '../dao';

export class MicroServiceService {
  private microserviceDAO: MicroserviceDAO;

  constructor() {
    this.microserviceDAO = new MicroserviceDAO();
  }

}
