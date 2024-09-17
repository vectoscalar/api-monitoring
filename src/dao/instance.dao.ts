import BaseDAO from "../common/base.dao";
import mongoose from "mongoose";
import { InstanceModel, IInstance } from "../models/instance.model";
import { APIMonitorMongooseClient } from "../clients/mongoClient";

export class InstanceDAO extends BaseDAO {
  protected readonly model: mongoose.Model<IInstance>;

  constructor() {
    super(APIMonitorMongooseClient.models.InstanceModel);
    this.model = APIMonitorMongooseClient.models.InstanceModel;
  }

  async upsertInstance(microserviceId: string, id: string) {
    const instance = await this.model.findOneAndUpdate(
      { microserviceId, id },
      { microserviceId, id },
      { new: true, upsert: true }
    ).exec();
    return instance;
  }

}