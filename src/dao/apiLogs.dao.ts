import mongoose from "mongoose";
import { APIMonitorMongooseClient } from "../../src/clients/mongoClient";
import BaseDAO from "../common/base.dao";
import { APILogModel, IAPILog } from "../models/apiLogs.model";

export class APILogDAO extends BaseDAO {
  public readonly model: mongoose.Model<IAPILog>;

  constructor() {
    super(APIMonitorMongooseClient.models.APILogModel);
    this.model = APIMonitorMongooseClient.models.APILogModel;
  }

  async getLatestInvocations(query: any, limit: number, offset: number) {
    const invocations = await this.model
      .find(query)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit);

    const totalCount = await this.model.countDocuments(query);
    return { invocations, totalCount };
  }

  async getAverageResponseTimeByFilters(query: any) {
    const matchingDocs = await this.model.find(query);

    const result = await this.model.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          averageResponseTime: { $avg: "$responseTime" },
        },
      },
    ]);
    return result.length > 0 ? result[0].averageResponseTime : null;
  }

  async getMinResponseTime(query: any) {
    const result = await this.model.aggregate([
      { $match: query },
      { $sort: { responseTime: 1 } },
      { $limit: 1 },
    ]);
    return result.length > 0 ? result[0].responseTime : null;
  }

  async getMaxResponseTime(query: any) {
    const result = await this.model.aggregate([
      { $match: query },
      { $sort: { responseTime: -1 } },
      { $limit: 1 },
    ]);
    return result.length > 0 ? result[0].responseTime : null;
  }
}
