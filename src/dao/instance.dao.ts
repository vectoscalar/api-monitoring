import BaseDAO from "../common/base.dao";
import mongoose from "mongoose";
import { InstanceModel, IInstance } from "../models/instance.model";

export class InstanceDAO extends BaseDAO {
  protected readonly model: mongoose.Model<IInstance>;

  constructor() {
    super(InstanceModel);
    this.model = InstanceModel;
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