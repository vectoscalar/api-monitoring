import mongoose from "mongoose";
import { APIMonitorMongooseClient } from "../../src/clients/mongoClient";

import BaseDAO from "../common/base.dao";
import { EndpointModel, IEndpoint } from "../models/endpoint.model";

export class EndpointDAO extends BaseDAO {
  public readonly model: mongoose.Model<IEndpoint>;

  constructor() {
    super(APIMonitorMongooseClient.models.EndpointModel);
    this.model = APIMonitorMongooseClient.models.EndpointModel;
  }

  async getALLEndpointsByMicroserviceId(microserviceId: string) {
    const query = { microserviceId, deletedAt: null };
    return this.find(query);
  }
}
