import mongoose from "mongoose";
import BaseDAO from "../common/base.dao";
import { APIMonitorMongooseClient } from "../../src/clients/mongoClient";

import { MicroserviceModel, IMicroservice } from "../models/microservice.model";
import { logger } from "../common/services";

export class MicroserviceDAO extends BaseDAO {
  public readonly model: mongoose.Model<IMicroservice>;

  constructor() {
    super(APIMonitorMongooseClient.models.MicroserviceModel);
    this.model = APIMonitorMongooseClient.models.MicroserviceModel;
  }

  async updateOne(operations: any): Promise<any> {
    return this.model.collection.updateOne(operations.filter, operations.update);
  }

  async upsertMicroservice(
    projectId: mongoose.Types.ObjectId,
    name: string,
    envType: string
  ): Promise<IMicroservice | null> {
    const existingMicroservice = await this.findOne({ projectId, name });

    if (existingMicroservice) {
      return existingMicroservice;
    } else {
      const newMicroservice = await this.create({
        projectId,
        name,
        apiKey: new mongoose.Types.ObjectId(),
        envType,
      });

      return newMicroservice;
    }
  }

  async getMicroserviceDetailsByApiKey(apiKey: string) {
    try {
      return this.model.aggregate([
        { $match: { apiKey: new mongoose.Types.ObjectId(apiKey) } },
        {
          $lookup: {
            from: "projects",
            localField: "projectId",
            foreignField: "_id",
            as: "project",
          },
        },
        { $unwind: "$project" },
        {
          $lookup: {
            from: "organizations",
            localField: "project.organizationId",
            foreignField: "_id",
            as: "organization",
          },
        },
        { $unwind: "$organization" },
        {
          $project: {
            microserviceId: "$_id",
            organizationId: "$organization._id",
            projectId: "$project._id",
          },
        },
      ]);
    } catch (error) {
      logger.trace("Error in getMicroserviceDetailsByApiKey:", error);
      throw error;
    }
  }
}
