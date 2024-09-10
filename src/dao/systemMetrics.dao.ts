import BaseDAO from "../common/base.dao";
import mongoose from "mongoose";
import { SystemMetricsModel, ISystemMetrics } from "../models/systemMetrics.model";

export class SystemMetricsDAO extends BaseDAO {
  protected readonly model: mongoose.Model<ISystemMetrics>;

  constructor() {
    super(SystemMetricsModel);
    this.model = SystemMetricsModel;
  }

}