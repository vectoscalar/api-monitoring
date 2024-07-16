import BaseDAO from "../common/base.dao";
import { OrganizationModel, IOrganization } from "../models/organization.model";

export class OrganizationDAO extends BaseDAO {
  protected readonly model;

  constructor() {
    super(OrganizationModel); 
    this.model = OrganizationModel;
  }


  async upsertOrganization(name: string, gst: string): Promise<IOrganization | null> {
    const org = await this.model.findOneAndUpdate(
      { name, gst },
      { name, gst, updatedAt: new Date() },
      { new: true, upsert: true }
    ).exec();
    return org;
  }
  
}