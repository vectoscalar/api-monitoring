import { OrganizationDAO } from '../dao';


export class OrganizationService{
  private organizationDAO: OrganizationDAO;

  constructor() {
    this.organizationDAO = new OrganizationDAO();
  }
  
}
