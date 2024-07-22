import mongoose from "mongoose";
import BaseDAO from "../common/base.dao";

import { OrganizationModel, IOrganization } from "../models/organization.model";

export class OrganizationDAO extends BaseDAO {
  protected readonly model : mongoose.Model<IOrganization>;

  constructor() {
    super(OrganizationModel); 
    this.model = OrganizationModel;
  }


  async upsertOrganization(name: string): Promise<IOrganization | null> {
    const org = await this.model.findOneAndUpdate(
      { name },
      { name, updatedAt: new Date() },
      { new: true, upsert: true }
    ).exec();
    return org;
  }
  
}