import mongoose from "mongoose";
import BaseDAO from "../common/base.dao";
import { APIMonitorMongooseClient } from "../../src/clients/mongoClient";

import { OrganizationModel, IOrganization } from "../models/organization.model";

export class OrganizationDAO extends BaseDAO {
  public readonly model: mongoose.Model<IOrganization>;

  constructor() {
    super(APIMonitorMongooseClient.models.OrganizationModel);
    this.model = APIMonitorMongooseClient.models.OrganizationModel;
  }

  async upsertOrganization(name: string): Promise<IOrganization | null> {
    const org = await this.model
      .findOneAndUpdate(
        { name },
        { name, updatedAt: new Date() },
        { new: true, upsert: true }
      )
      .exec();
    return org;
  }
}
