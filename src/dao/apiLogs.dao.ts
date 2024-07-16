import mongoose from "mongoose";
import BaseDAO from "../common/base.dao";
import { APILogModel, IAPILog } from "../models/apiLogs.model";

export class APILogDAO extends BaseDAO {
  protected readonly model: mongoose.Model<IAPILog>;

  constructor() {
    super(APILogModel);
    this.model = APILogModel;
  }


}