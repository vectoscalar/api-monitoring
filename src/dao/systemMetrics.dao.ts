import BaseDAO from "../common/base.dao";
import mongoose from "mongoose";
import { SystemMetricsModel, ISystemMetrics } from "../models/systemMetrics.model";
import { APIMonitorMongooseClient } from "../clients/mongoClient";

export class SystemMetricsDAO extends BaseDAO {
  protected readonly model: mongoose.Model<ISystemMetrics>;

  constructor() {
    super(APIMonitorMongooseClient.models.SystemMetricsModel);
    this.model = APIMonitorMongooseClient.models.SystemMetricsModel;
  }

}