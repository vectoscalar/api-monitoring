import mongoose from "mongoose";

import BaseDAO from "../common/base.dao";
import { APIMonitorMongooseClient } from "../../src/clients/mongoClient";

import { UserModel } from "../models/user.model";

export class UserDAO extends BaseDAO {
  public readonly model: mongoose.Model<any>;

  constructor() {
    super(APIMonitorMongooseClient.models.UserModel);
    this.model = APIMonitorMongooseClient.models.UserModel;
  }
}
