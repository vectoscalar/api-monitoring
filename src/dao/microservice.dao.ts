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
      return existingMicroservice._id;
    }else {
      const newMicroservice = await this.create({
        projectId,
        name,
        apiKey: new mongoose.Types.ObjectId(), 
      });

      return newMicroservice._id;
    }
  }

  async getAccountDetailsByApiKey(apiKey: string) {
    try {

      const result = await this.model.aggregate([
        { $match: { apiKey: new mongoose.Types.ObjectId(apiKey) } },
        {
          $lookup: {
            from: 'projects',
            localField: 'projectId',
            foreignField: '_id',
            as: 'project'
          }
        },
        { $unwind: '$project' },
        {
          $lookup: {
            from: 'organizations',
            localField: 'project.organizationId',
            foreignField: '_id',
            as: 'organization'
          }
        },
        { $unwind: '$organization' },
        {
          $project: {
            microserviceId: '$_id',
            organizationId: '$organization._id',
            projectId: '$project._id'
          }
        }
      ]);

      logger.trace('Account details for for apiKey:', apiKey, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.trace('Error in getAccountDetailsByApiKey:', error);
      throw error;
    }
  }


}