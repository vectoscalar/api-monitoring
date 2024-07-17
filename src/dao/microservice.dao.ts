import mongoose from "mongoose";
import BaseDAO from "../common/base.dao";
import { MicroserviceModel, IMicroservice } from "../models/microservice.model";

export class MicroserviceDAO extends BaseDAO {
  protected readonly model : mongoose.Model<IMicroservice>;

  constructor() {
    super(MicroserviceModel);
    this.model = MicroserviceModel;
  }

  async upsertMicroservice(projectId: mongoose.Types.ObjectId, name: string): Promise<IMicroservice | null> {
    const microservice = await this.model.findOneAndUpdate(
      { projectId, name },
      { projectId, name, updatedAt: new Date() },
      { new: true, upsert: true }
    ).exec();
    return microservice;
  }

  async getAllMicroservicesByProjectId(projectId : string) {
    const query = { projectId  ,deletedAt: null };
    return this.find(query);
  }

}