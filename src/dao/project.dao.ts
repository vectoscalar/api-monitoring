import BaseDAO from "../common/base.dao";
import mongoose from "mongoose";
import { APIMonitorMongooseClient } from "../../src/clients/mongoClient";

import { ProjectModel, IProject } from "../models/project.model";

export class ProjectDAO extends BaseDAO {
  public readonly model: mongoose.Model<IProject>;

  constructor() {
    super(APIMonitorMongooseClient.models.ProjectModel);
    this.model = APIMonitorMongooseClient.models.ProjectModel;
  }

  async upsertProject(
    organizationId: mongoose.Types.ObjectId,
    name: string
  ): Promise<IProject | null> {
    const project = await this.model
      .findOneAndUpdate(
        { organizationId, name },
        { organizationId, name, updatedAt: new Date() },
        { new: true, upsert: true }
      )
      .exec();
    return project;
  }
}
