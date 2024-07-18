import mongoose from "mongoose";
import BaseDAO from "../common/base.dao";
import { EndpointModel, IEndpoint } from "../models/endpoint.model";

export class EndpointDAO extends BaseDAO {
  protected readonly model: mongoose.Model<IEndpoint>;

  constructor() {
    super(EndpointModel);
    this.model = EndpointModel;
  }

  async getALLEndpointsByMicroserviceId(microserviceId: string) {
    const query = { microserviceId,deletedAt: null };
    return this.find(query);
  }

}