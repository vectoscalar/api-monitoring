import { OrganizationDAO } from '../dao';
import { BaseService } from '../common/services/index';


export class OrganizationService extends BaseService {
  private organizationDAO: OrganizationDAO;

  constructor() {
    super();
    this.organizationDAO = new OrganizationDAO();
  }

  

}
