import mongoose from "mongoose";
import BaseDAO from "../common/base.dao";
import { MicroserviceModel, IMicroservice } from "../models/microservice.model";
import { logger } from "../common/services";

export class MicroserviceDAO extends BaseDAO {
  protected readonly model : mongoose.Model<IMicroservice>;

  constructor() {
    super(MicroserviceModel);
    this.model = MicroserviceModel;
  }

  async upsertMicroservice(projectId: mongoose.Types.ObjectId, name: string): Promise<IMicroservice | null> {
    const existingMicroservice = await this.findOne({ projectId, name });

    if (existingMicroservice) {
      return existingMicroservice;
    }else {
      const newMicroservice = await this.create({
        projectId,
        name,
        apiKey: new mongoose.Types.ObjectId(), 
      });

      return newMicroservice;
    }
  }


}