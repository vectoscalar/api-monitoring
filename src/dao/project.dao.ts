import BaseDAO from "../common/base.dao";
import mongoose from "mongoose";
import { ProjectModel, IProject } from "../models/project.model";

export class ProjectDAO extends BaseDAO {
  protected readonly model: mongoose.Model<IProject>;

  constructor() {
    super(ProjectModel);
    this.model = ProjectModel;
  }


  async upsertProject(organizationId: mongoose.Types.ObjectId, name: string): Promise<IProject | null> {
    const project = await this.model.findOneAndUpdate(
      { organizationId, name },
      { organizationId, name, updatedAt: new Date() },
      { new: true, upsert: true }
    ).exec();
    return project;
  }

}